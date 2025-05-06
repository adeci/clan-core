import argparse
import json
import logging
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from clan_lib.api import API

from clan_cli.cmd import RunOpts, run_no_stdout
from clan_cli.completions import add_dynamic_completer, complete_machines
from clan_cli.dirs import specific_machine_dir
from clan_cli.errors import ClanCmdError, ClanError
from clan_cli.flake import Flake
from clan_cli.git import commit_file
from clan_cli.machines.machines import Machine
from clan_cli.nix import nix_config, nix_eval

from .types import machine_name_type

log = logging.getLogger(__name__)


class HardwareConfig(Enum):
    NIXOS_FACTER = "nixos-facter"
    NIXOS_GENERATE_CONFIG = "nixos-generate-config"
    NONE = "none"

    def config_path(self, clan_dir: Path, machine_name: str) -> Path:
        machine_dir = specific_machine_dir(clan_dir, machine_name)
        if self == HardwareConfig.NIXOS_FACTER:
            return machine_dir / "facter.json"
        return machine_dir / "hardware-configuration.nix"

    @classmethod
    def detect_type(
        cls: type["HardwareConfig"], clan_dir: Path, machine_name: str
    ) -> "HardwareConfig":
        hardware_config = HardwareConfig.NIXOS_GENERATE_CONFIG.config_path(
            clan_dir, machine_name
        )

        if hardware_config.exists() and "throw" not in hardware_config.read_text():
            return HardwareConfig.NIXOS_GENERATE_CONFIG

        if HardwareConfig.NIXOS_FACTER.config_path(clan_dir, machine_name).exists():
            return HardwareConfig.NIXOS_FACTER

        return HardwareConfig.NONE


@API.register
def show_machine_hardware_config(clan_dir: Path, machine_name: str) -> HardwareConfig:
    """
    Show hardware information for a machine returns None if none exist.
    """
    return HardwareConfig.detect_type(clan_dir, machine_name)


@API.register
def show_machine_hardware_platform(clan_dir: Path, machine_name: str) -> str | None:
    """
    Show hardware information for a machine returns None if none exist.
    """
    config = nix_config()
    system = config["system"]
    cmd = nix_eval(
        [
            f"{clan_dir}#clanInternals.machines.{system}.{machine_name}",
            "--apply",
            "machine: { inherit (machine.pkgs) system; }",
            "--json",
        ]
    )
    proc = run_no_stdout(cmd, RunOpts(prefix=machine_name))
    res = proc.stdout.strip()

    host_platform = json.loads(res)
    return host_platform.get("system", None)


@dataclass
class HardwareGenerateOptions:
    flake: Flake
    machine: str
    backend: HardwareConfig
    target_host: str | None = None
    keyfile: str | None = None
    password: str | None = None


@API.register
def generate_machine_hardware_info(opts: HardwareGenerateOptions) -> HardwareConfig:
    """
    Generate hardware information for a machine
    and place the resulting *.nix file in the machine's directory.
    """

    machine = Machine(opts.machine, flake=opts.flake)

    if opts.keyfile is not None:
        machine.private_key = Path(opts.keyfile)

    if opts.target_host is not None:
        machine.override_target_host = opts.target_host

    hw_file = opts.backend.config_path(opts.flake.path, opts.machine)
    hw_file.parent.mkdir(parents=True, exist_ok=True)

    if opts.backend == HardwareConfig.NIXOS_FACTER:
        config_command = ["nixos-facter"]
    else:
        config_command = [
            "nixos-generate-config",
            # Filesystems are managed by disko
            "--no-filesystems",
            "--show-hardware-config",
        ]

    with machine.target_host() as host:
        host.ssh_options["StrictHostKeyChecking"] = "accept-new"
        host.ssh_options["UserKnownHostsFile"] = "/dev/null"
        if opts.password:
            host.password = opts.password

        out = host.run(config_command, become_root=True, opts=RunOpts(check=False))
        if out.returncode != 0:
            if "nixos-facter" in out.stderr and "not found" in out.stderr:
                machine.error(str(out.stderr))
                msg = (
                    "Please use our custom nixos install images from https://github.com/nix-community/nixos-images/releases/tag/nixos-unstable. "
                    "nixos-factor only works on nixos / clan systems currently."
                )
                raise ClanError(msg)

            machine.error(str(out))
            msg = f"Failed to inspect {opts.machine}. Address: {host.target}"
            raise ClanError(msg)

    backup_file = None
    if hw_file.exists():
        backup_file = hw_file.with_suffix(".bak")
        hw_file.replace(backup_file)
    hw_file.write_text(out.stdout)
    print(f"Successfully generated: {hw_file}")

    # try to evaluate the machine
    # If it fails, the hardware-configuration.nix file is invalid

    commit_file(
        hw_file,
        opts.flake.path,
        f"machines/{opts.machine}/{hw_file.name}: update hardware configuration",
    )
    try:
        show_machine_hardware_platform(opts.flake.path, opts.machine)
        if backup_file:
            backup_file.unlink(missing_ok=True)
    except ClanCmdError as e:
        log.exception("Failed to evaluate hardware-configuration.nix")
        # Restore the backup file
        print(f"Restoring backup file {backup_file}")
        if backup_file:
            backup_file.replace(hw_file)
        # TODO: Undo the commit

        msg = "Invalid hardware-configuration.nix file"
        raise ClanError(
            msg,
            description=f"Configuration at '{hw_file}' is invalid. Please check the file and try again.",
        ) from e

    return opts.backend


def update_hardware_config_command(args: argparse.Namespace) -> None:
    opts = HardwareGenerateOptions(
        flake=args.flake,
        machine=args.machine,
        target_host=args.target_host,
        password=args.password,
        backend=HardwareConfig(args.backend),
    )
    generate_machine_hardware_info(opts)


def register_update_hardware_config(parser: argparse.ArgumentParser) -> None:
    parser.set_defaults(func=update_hardware_config_command)
    machine_parser = parser.add_argument(
        "machine",
        help="the name of the machine",
        type=machine_name_type,
    )
    add_dynamic_completer(machine_parser, complete_machines)
    parser.add_argument(
        "target_host",
        type=str,
        nargs="?",
        help="ssh address to install to in the form of user@host:2222",
    )
    parser.add_argument(
        "--password",
        help="Pre-provided password the cli will prompt otherwise if needed.",
        type=str,
        required=False,
    )
    parser.add_argument(
        "--backend",
        help="The type of hardware report to generate.",
        choices=["nixos-generate-config", "nixos-facter"],
        default="nixos-facter",
    )
