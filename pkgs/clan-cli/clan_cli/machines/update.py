import argparse
import json
import logging
import os
import re
import shlex
import sys
from contextlib import ExitStack

from clan_lib.api import API
from clan_lib.async_run import AsyncContext, AsyncOpts, AsyncRuntime, is_async_cancelled
from clan_lib.cmd import Log, MsgColor, RunOpts, run
from clan_lib.colors import AnsiColor
from clan_lib.errors import ClanError
from clan_lib.machines.machines import Machine
from clan_lib.nix import nix_command, nix_config, nix_metadata
from clan_lib.ssh.remote import HostKeyCheck, Remote

from clan_cli.completions import (
    add_dynamic_completer,
    complete_machines,
)
from clan_cli.facts.generate import generate_facts
from clan_cli.facts.upload import upload_secrets
from clan_cli.machines.list import list_full_machines
from clan_cli.vars.generate import generate_vars
from clan_cli.vars.upload import upload_secret_vars

log = logging.getLogger(__name__)


def is_local_input(node: dict[str, dict[str, str]]) -> bool:
    locked = node.get("locked")
    if not locked:
        return False
    # matches path and git+file://
    local = (
        locked["type"] == "path"
        # local vcs inputs i.e. git+file:///
        or re.match(r"^file://", locked.get("url", "")) is not None
    )
    if local:
        print(f"[WARN] flake input has local node: {json.dumps(node)}")
    return local


def upload_sources(machine: Machine, ssh: Remote) -> str:
    env = ssh.nix_ssh_env(os.environ.copy())

    flake_url = (
        str(machine.flake.path) if machine.flake.is_local else machine.flake.identifier
    )
    flake_data = nix_metadata(flake_url)
    has_path_inputs = any(
        is_local_input(node) for node in flake_data["locks"]["nodes"].values()
    )

    if not has_path_inputs:
        # Just copy the flake to the remote machine, we can substitute other inputs there.
        path = flake_data["path"]
        cmd = nix_command(
            [
                "copy",
                "--to",
                f"ssh://{ssh.target}",
                "--no-check-sigs",
                path,
            ]
        )
        run(
            cmd,
            RunOpts(
                env=env,
                needs_user_terminal=True,
                error_msg="failed to upload sources",
                prefix=machine.name,
            ),
        )
        return path

    # Slow path: we need to upload all sources to the remote machine
    cmd = nix_command(
        [
            "flake",
            "archive",
            "--to",
            f"ssh://{ssh.target}",
            "--json",
            flake_url,
        ]
    )
    proc = run(
        cmd,
        RunOpts(
            env=env, needs_user_terminal=True, error_msg="failed to upload sources"
        ),
    )

    try:
        return json.loads(proc.stdout)["path"]
    except (json.JSONDecodeError, OSError) as e:
        msg = f"failed to parse output of {shlex.join(cmd)}: {e}\nGot: {proc.stdout}"
        raise ClanError(msg) from e


@API.register
def deploy_machine(
    machine: Machine, target_host: Remote, build_host: Remote | None
) -> None:
    with ExitStack() as stack:
        target_host = stack.enter_context(target_host.ssh_control_master())

        if build_host is not None:
            build_host = stack.enter_context(build_host.ssh_control_master())

        host = build_host or target_host

        sudo_host = stack.enter_context(target_host.become_root())

        generate_facts([machine], service=None, regenerate=False)
        generate_vars([machine], generator_name=None, regenerate=False)

        upload_secrets(machine, sudo_host)
        upload_secret_vars(machine, sudo_host)

        path = upload_sources(machine, sudo_host)

        nix_options = [
            "--show-trace",
            "--option",
            "keep-going",
            "true",
            "--option",
            "accept-flake-config",
            "true",
            "-L",
            *machine.nix_options,
            "--flake",
            f"{path}#{machine.name}",
        ]

        become_root = True

        if machine._class_ == "nixos":
            nix_options += [
                "--fast",
                "--build-host",
                "",
            ]

            if build_host:
                become_root = False
                nix_options += ["--target-host", target_host.target]

                if target_host.user != "root":
                    nix_options += ["--use-remote-sudo"]
            switch_cmd = ["nixos-rebuild", "switch", *nix_options]
        elif machine._class_ == "darwin":
            # use absolute path to darwin-rebuild
            switch_cmd = [
                "/run/current-system/sw/bin/darwin-rebuild",
                "switch",
                *nix_options,
            ]

        if become_root:
            host = sudo_host

        remote_env = host.nix_ssh_env(control_master=False)
        ret = host.run(
            switch_cmd,
            RunOpts(
                check=False,
                log=Log.BOTH,
                msg_color=MsgColor(stderr=AnsiColor.DEFAULT),
                needs_user_terminal=True,
            ),
            extra_env=remote_env,
        )

        if is_async_cancelled():
            return

        # retry nixos-rebuild switch if the first attempt failed
        if ret.returncode != 0:
            is_mobile = machine.deployment.get("nixosMobileWorkaround", False)
            # if the machine is mobile, we retry to deploy with the mobile workaround method
            if is_mobile:
                machine.info(
                    "Mobile machine detected, applying workaround deployment method"
                )
            ret = host.run(
                ["nixos--rebuild", "test", *nix_options] if is_mobile else switch_cmd,
                RunOpts(
                    log=Log.BOTH,
                    msg_color=MsgColor(stderr=AnsiColor.DEFAULT),
                    needs_user_terminal=True,
                ),
                extra_env=remote_env,
            )


def update_command(args: argparse.Namespace) -> None:
    try:
        if args.flake is None:
            msg = "Could not find clan flake toplevel directory"
            raise ClanError(msg)

        machines: list[Machine] = []
        # if no machines are passed, we will update all machines
        selected_machines = (
            args.machines if args.machines else list_full_machines(args.flake).keys()
        )

        for machine_name in selected_machines:
            machine = Machine(
                name=machine_name,
                flake=args.flake,
                nix_options=args.option,
                host_key_check=HostKeyCheck.from_str(args.host_key_check),
            )
            machines.append(machine)

        if args.target_host is not None and len(machines) > 1:
            msg = "Target Host can only be set for one machines"
            raise ClanError(msg)

        def filter_machine(m: Machine) -> bool:
            if m.deployment.get("requireExplicitUpdate", False):
                return False

            try:
                # check if the machine has a target host set
                m.target_host  # noqa: B018
            except ClanError:
                return False

            return True

        machines_to_update = machines
        implicit_all: bool = len(args.machines) == 0
        if implicit_all:
            machines_to_update = list(filter(filter_machine, machines))

        # machines that are in the list but not included in the update list
        ignored_machines = {m.name for m in machines if m not in machines_to_update}

        if not machines_to_update and ignored_machines:
            print(
                "WARNING: No machines to update.\n"
                "The following defined machines were ignored because they\n"
                "- Require explicit update (see 'requireExplicitUpdate')\n",
                "- Might not have the `clan.core.networking.targetHost` nixos option set:\n",
                file=sys.stderr,
            )
            for m in ignored_machines:
                print(m, file=sys.stderr)

        if machines_to_update:
            # Prepopulate the cache
            config = nix_config()
            system = config["system"]
            machine_names = [machine.name for machine in machines_to_update]
            args.flake.precache(
                [
                    f"clanInternals.machines.{system}.{{{','.join(machine_names)}}}.config.clan.core.vars.generators.*.validationHash",
                    f"clanInternals.machines.{system}.{{{','.join(machine_names)}}}.config.system.clan.deployment.file",
                ]
            )

            host_key_check = HostKeyCheck.from_str(args.host_key_check)
            with AsyncRuntime() as runtime:
                for machine in machines:
                    if args.target_host:
                        target_host = Remote.from_deployment_address(
                            machine_name=machine.name,
                            address=args.target_host,
                            host_key_check=host_key_check,
                        )
                    else:
                        target_host = machine.target_host()
                    runtime.async_run(
                        AsyncOpts(
                            tid=machine.name,
                            async_ctx=AsyncContext(prefix=machine.name),
                        ),
                        deploy_machine,
                        machine=machine,
                        target_host=target_host,
                        build_host=machine.build_host(),
                    )
                runtime.join_all()
                runtime.check_all()

    except KeyboardInterrupt:
        log.warning("Interrupted by user")
        sys.exit(1)


def register_update_parser(parser: argparse.ArgumentParser) -> None:
    machines_parser = parser.add_argument(
        "machines",
        type=str,
        nargs="*",
        default=[],
        metavar="MACHINE",
        help="Machine to update. If no machines are specified, all machines that don't require explicit updates will be updated.",
    )
    add_dynamic_completer(machines_parser, complete_machines)

    parser.add_argument(
        "--host-key-check",
        choices=["strict", "ask", "tofu", "none"],
        default="ask",
        help="Host key (.ssh/known_hosts) check mode.",
    )
    parser.add_argument(
        "--target-host",
        type=str,
        help="Address of the machine to update, in the format of user@host:1234.",
    )
    parser.add_argument(
        "--build-host",
        type=str,
        help="Address of the machine to build the flake, in the format of user@host:1234.",
    )
    parser.set_defaults(func=update_command)
