import argparse
import logging

from clan_cli.completions import add_dynamic_completer, complete_machines
from clan_cli.errors import ClanError
from clan_cli.machines.machines import Machine

log = logging.getLogger(__name__)


def fix_vars(machine: Machine, generator_name: None | str = None) -> None:
    generators = machine.vars_generators
    if generator_name:
        for generator in generators:
            if generator_name == generator.name:
                generators = [generator]
                break
        else:
            err_msg = (
                f"Generator '{generator_name}' not found in machine {machine.name}"
            )
            raise ClanError(err_msg)

    for generator in generators:
        machine.public_vars_store.fix(generator=generator)
        machine.secret_vars_store.fix(generator=generator)


def fix_command(args: argparse.Namespace) -> None:
    machine = Machine(
        name=args.machine,
        flake=args.flake,
    )
    fix_vars(machine, generator_name=args.generator)


def register_fix_parser(parser: argparse.ArgumentParser) -> None:
    machines_parser = parser.add_argument(
        "machine",
        help="The machine to fix vars for",
    )
    add_dynamic_completer(machines_parser, complete_machines)

    parser.add_argument(
        "--generator",
        "-g",
        help="the generator to check",
    )
    parser.set_defaults(func=fix_command)
