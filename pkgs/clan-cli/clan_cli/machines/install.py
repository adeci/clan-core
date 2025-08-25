import argparse
import json
import logging
import sys
from contextlib import ExitStack
from pathlib import Path
from typing import get_args

from clan_lib.errors import ClanError
from clan_lib.flake import require_flake
from clan_lib.machines.install import BuildOn, InstallOptions, run_machine_install
from clan_lib.machines.machines import Machine
from clan_lib.network.qr_code import read_qr_image, read_qr_json
from clan_lib.ssh.host_key import HostKeyCheck
from clan_lib.ssh.remote import Remote

from clan_cli.completions import (
    add_dynamic_completer,
    complete_machines,
    complete_target_host,
)
from clan_cli.machines.hardware import HardwareConfig

log = logging.getLogger(__name__)


def install_command(args: argparse.Namespace) -> None:
    try:
        flake = require_flake(args.flake)
        # Only if the caller did not specify a target_host via args.target_host
        # Find a suitable target_host that is reachable
        with ExitStack() as stack:
            remote: Remote
            if args.target_host:
                # TODO add network support here with either --network or some url magic
                remote = Remote.from_ssh_uri(
                    machine_name=args.machine,
                    address=args.target_host,
                )
            elif args.png:
                data = read_qr_image(Path(args.png))
                qr_code = read_qr_json(data, args.flake)
                remote = stack.enter_context(qr_code.get_best_remote())
            elif args.json:
                json_file = Path(args.json)
                if json_file.is_file():
                    data = json.loads(json_file.read_text())
                else:
                    data = json.loads(args.json)

                qr_code = read_qr_json(data, args.flake)
                remote = stack.enter_context(qr_code.get_best_remote())
            else:
                msg = "No --target-host, --json or --png data provided"
                raise ClanError(msg)

            machine = Machine(name=args.machine, flake=flake)
            if args.host_key_check:
                remote.override(host_key_check=args.host_key_check)

            if machine._class_ == "darwin":
                msg = "Installing macOS machines is not yet supported"
                raise ClanError(msg)

            if not args.yes:
                while True:
                    ask = (
                        input(f"Install {args.machine} to {remote.target}? [y/N] ")
                        .strip()
                        .lower()
                    )
                    if ask == "y":
                        break
                    if ask == "n" or ask == "":
                        return None
                    print(
                        f"Invalid input '{ask}'. Please enter 'y' for yes or 'n' for no.",
                    )

            if args.identity_file:
                remote = remote.override(private_key=args.identity_file)

            if args.password:
                remote = remote.override(password=args.password)

            return run_machine_install(
                InstallOptions(
                    machine=machine,
                    kexec=args.kexec,
                    phases=args.phases,
                    debug=args.debug,
                    no_reboot=args.no_reboot,
                    build_on=args.build_on if args.build_on is not None else None,
                    update_hardware_config=HardwareConfig(args.update_hardware_config),
                    persist_state=not args.no_persist_state,
                ),
                target_host=remote,
            )
    except KeyboardInterrupt:
        log.warning("Interrupted by user")
        sys.exit(1)


def register_install_parser(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--kexec",
        type=str,
        help="use another kexec tarball to bootstrap NixOS",
    )
    parser.add_argument(
        "--no-reboot",
        action="store_true",
        help="do not reboot after installation (deprecated)",
        default=False,
    )
    parser.add_argument(
        "--host-key-check",
        choices=list(get_args(HostKeyCheck)),
        default="ask",
        help="Host key (.ssh/known_hosts) check mode.",
    )

    parser.add_argument(
        "--build-on",
        choices=list(get_args(BuildOn)),
        default=None,
        help="where to build the NixOS configuration",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="do not ask for confirmation",
        default=False,
    )
    parser.add_argument(
        "--update-hardware-config",
        type=str,
        default="none",
        help="update the hardware configuration",
        choices=[x.value for x in HardwareConfig],
    )
    parser.add_argument(
        "--no-persist-state",
        action="store_true",
        help="Disable persisting the result of the installation after it is done",
        default=False,
    )

    parser.add_argument(
        "--phases",
        type=str,
        help="comma separated list of phases to run. Default is: kexec,disko,install,reboot",
    )

    machines_parser = parser.add_argument(
        "machine",
        type=str,
        help="machine to install",
    )
    add_dynamic_completer(machines_parser, complete_machines)

    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument(
        "-j",
        "--json",
        help="specify the json file for ssh data (generated by starting the clan installer)",
    )
    target_host_parser = group.add_argument(
        "--target-host",
        help="ssh address to install to in the form of user@host:2222",
    )
    add_dynamic_completer(target_host_parser, complete_target_host)
    authentication_group = parser.add_mutually_exclusive_group()
    authentication_group.add_argument(
        "--password",
        help="specify the password for the ssh connection (generated by starting the clan installer)",
    )
    authentication_group.add_argument(
        "-i",
        dest="identity_file",
        type=Path,
        help="specify which SSH private key file to use",
    )
    group.add_argument(
        "-P",
        "--png",
        help="specify the json file for ssh data as the qrcode image (generated by starting the clan installer)",
    )

    parser.set_defaults(func=install_command)
