import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from clan_lib.cmd import run
from clan_lib.dirs import machine_gcroot
from clan_lib.errors import ClanError
from clan_lib.flake import Flake
from clan_lib.machines.actions import list_machines
from clan_lib.machines.machines import Machine
from clan_lib.nix import (
    nix_add_to_gcroots,
    nix_build,
    nix_config,
    nix_eval,
    nix_metadata,
)

from clan_cli.vms.inspect import VmConfig, inspect_vm


@dataclass
class FlakeConfig:
    flake_url: Flake
    flake_attr: str

    clan_name: str
    nar_hash: str
    icon: str | None
    description: str | None
    last_updated: str
    revision: str | None
    vm: VmConfig

    @classmethod
    def from_json(cls: type["FlakeConfig"], data: dict[str, Any]) -> "FlakeConfig":
        return cls(
            flake_url=Flake.from_json(data["flake_url"]),
            flake_attr=data["flake_attr"],
            clan_name=data["clan_name"],
            nar_hash=data["nar_hash"],
            icon=data.get("icon"),
            description=data.get("description"),
            last_updated=data["last_updated"],
            revision=data.get("revision"),
            vm=VmConfig.from_json(data["vm"]),
        )


def run_cmd(cmd: list[str]) -> str:
    proc = run(cmd)
    return proc.stdout.strip()


def inspect_flake(flake_url: str | Path, machine_name: str) -> FlakeConfig:
    config = nix_config()
    system = config["system"]

    # Check if the machine exists
    machines = list_machines(Flake(str(flake_url)))
    if machine_name not in machines:
        msg = f"Machine {machine_name} not found in {flake_url}. Available machines: {', '.join(machines)}"
        raise ClanError(msg)

    machine = Machine(machine_name, Flake(str(flake_url)))
    vm = inspect_vm(machine)

    # Make symlink to gcroots from vm.machine_icon
    if vm.machine_icon:
        gcroot_icon: Path = machine_gcroot(flake_url=str(flake_url)) / vm.machine_name
        nix_add_to_gcroots(vm.machine_icon, gcroot_icon)

    # Get the Clan name
    cmd = nix_eval(
        [
            f'{flake_url}#clanInternals.machines."{system}"."{machine_name}".config.clan.core.name'
        ]
    )
    res = run_cmd(cmd)
    clan_name = res.strip('"')

    # Get the clan icon path
    cmd = nix_eval(
        [
            f'{flake_url}#clanInternals.machines."{system}"."{machine_name}".config.clan.core.icon'
        ]
    )
    res = run_cmd(cmd)

    # If the icon is null, no icon is set for this Clan
    if res == "null":
        icon_path = None
    else:
        icon_path = res.strip('"')

        cmd = nix_build(
            [
                f'{flake_url}#clanInternals.machines."{system}"."{machine_name}".config.clan.core.icon'
            ],
            machine_gcroot(flake_url=str(flake_url)) / "icon",
        )
        run_cmd(cmd)

    # Get the flake metadata
    meta = nix_metadata(flake_url)
    return FlakeConfig(
        vm=vm,
        flake_url=Flake(str(flake_url)),
        clan_name=clan_name,
        flake_attr=machine_name,
        nar_hash=meta["locked"]["narHash"],
        icon=icon_path,
        description=meta.get("description"),
        last_updated=meta["lastModified"],
        revision=meta.get("revision"),
    )


@dataclass
class InspectOptions:
    machine: str
    flake: Flake


def inspect_command(args: argparse.Namespace) -> None:
    inspect_options = InspectOptions(
        machine=args.machine,
        flake=args.flake or Flake(str(Path.cwd())),
    )
    res = inspect_flake(
        flake_url=str(inspect_options.flake), machine_name=inspect_options.machine
    )
    print("Clan name:", res.clan_name)
    print("Icon:", res.icon)
    print("Description:", res.description)
    print("Last updated:", res.last_updated)
    print("Revision:", res.revision)


def register_inspect_parser(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--machine", type=str, default="defaultVM")
    parser.set_defaults(func=inspect_command)
