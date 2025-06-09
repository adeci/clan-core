# !/usr/bin/env python3
import argparse
import logging
from pathlib import Path

from clan_lib.clan.create import CreateOptions, create_clan

log = logging.getLogger(__name__)


def register_create_parser(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--input",
        type=str,
        help="""Flake input name to use as template source
        Example: --input clan-core
        """,
    )

    parser.add_argument(
        "--template",
        type=str,
        help="Clan template name",
        default="default",
    )

    parser.add_argument(
        "--no-git",
        help="Do not setup git",
        action="store_true",
        default=False,
    )

    parser.add_argument(
        "path",
        type=Path,
        help="Path where to write the clan template to",
        default=Path(),
    )

    parser.add_argument(
        "--no-update",
        help="Do not update the clan flake",
        action="store_true",
        default=False,
    )

    def create_flake_command(args: argparse.Namespace) -> None:
        create_clan(
            CreateOptions(
                input_name=args.input,
                dest=args.path,
                template_name=args.template,
                setup_git=not args.no_git,
                src_flake=args.flake,
                update_clan=not args.no_update,
            )
        )

    parser.set_defaults(func=create_flake_command)
