import argparse
import logging
from pathlib import Path
from tempfile import TemporaryDirectory

from clan_lib.flake import require_flake
from clan_lib.machines.machines import Machine
from clan_lib.ssh.remote import Remote

from clan_cli.completions import add_dynamic_completer, complete_machines
from clan_cli.ssh.upload import upload

log = logging.getLogger(__name__)


def upload_secrets(machine: Machine, host: Remote) -> None:
    if not machine.secret_facts_store.needs_upload(host):
        machine.info("Secrets already uploaded")
        return

    with TemporaryDirectory(prefix="facts-upload-") as _tempdir:
        local_secret_dir = Path(_tempdir).resolve()
        machine.secret_facts_store.upload(local_secret_dir)
        remote_secret_dir = Path(machine.secrets_upload_directory)
        upload(host, local_secret_dir, remote_secret_dir)


def upload_command(args: argparse.Namespace) -> None:
    flake = require_flake(args.flake)
    machine = Machine(name=args.machine, flake=flake)
    with machine.target_host().ssh_control_master() as host:
        upload_secrets(machine, host)


def register_upload_parser(parser: argparse.ArgumentParser) -> None:
    machines_parser = parser.add_argument(
        "machine",
        help="The machine to upload secrets to",
    )
    add_dynamic_completer(machines_parser, complete_machines)

    parser.set_defaults(func=upload_command)
