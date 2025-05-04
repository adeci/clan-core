import argparse
import json
from dataclasses import dataclass

from clan_cli.cmd import Log, RunOpts
from clan_cli.completions import (
    add_dynamic_completer,
    complete_backup_providers_for_machine,
    complete_machines,
)
from clan_cli.errors import ClanError
from clan_cli.machines.machines import Machine
from clan_cli.ssh.host import Host


@dataclass
class Backup:
    name: str
    job_name: str | None = None


def list_provider(machine: Machine, host: Host, provider: str) -> list[Backup]:
    results = []
    backup_metadata = machine.eval_nix("config.clan.core.backups")
    list_command = backup_metadata["providers"][provider]["list"]
    proc = host.run(
        [list_command],
        RunOpts(log=Log.NONE, check=False),
    )
    if proc.returncode != 0:
        # TODO this should be a warning, only raise exception if no providers succeed
        msg = f"Failed to list backups for provider {provider}:"
        msg += f"\n{list_command} exited with {proc.returncode}"
        if proc.stderr:
            msg += f"\nerror output: {proc.stderr}"
        raise ClanError(msg)

    try:
        parsed_json = json.loads(proc.stdout)
    except json.JSONDecodeError as e:
        msg = f"Failed to parse json output from provider {provider}:\n{proc.stdout}"
        raise ClanError(msg) from e

    for archive in parsed_json:
        results.append(Backup(name=archive["name"], job_name=archive.get("job_name")))
    return results


def list_backups(machine: Machine, provider: str | None = None) -> list[Backup]:
    backup_metadata = machine.eval_nix("config.clan.core.backups")
    results = []
    with machine.target_host() as host:
        if provider is None:
            for _provider in backup_metadata["providers"]:
                results += list_provider(machine, host, _provider)

        else:
            results += list_provider(machine, host, provider)

    return results


def list_command(args: argparse.Namespace) -> None:
    if args.flake is None:
        msg = "Could not find clan flake toplevel directory"
        raise ClanError(msg)
    machine = Machine(name=args.machine, flake=args.flake)
    backups = list_backups(machine=machine, provider=args.provider)
    for backup in backups:
        print(backup.name)


def register_list_parser(parser: argparse.ArgumentParser) -> None:
    machines_parser = parser.add_argument(
        "machine", type=str, help="machine in the flake to show backups of"
    )
    add_dynamic_completer(machines_parser, complete_machines)
    provider_action = parser.add_argument(
        "--provider", type=str, help="backup provider to filter by"
    )
    add_dynamic_completer(provider_action, complete_backup_providers_for_machine)
    parser.set_defaults(func=list_command)
