import logging
from dataclasses import dataclass
from pathlib import Path

from clan_lib.api import API
from clan_lib.cmd import RunOpts, run
from clan_lib.errors import ClanError
from clan_lib.flake import Flake
from clan_lib.nix import nix_command, nix_metadata, nix_shell
from clan_lib.persist.inventory_store import InventorySnapshot, InventoryStore
from clan_lib.templates import (
    TemplateName,
    get_template,
)
from clan_lib.templates.filesystem import copy_from_nixstore

log = logging.getLogger(__name__)


@dataclass
class CreateOptions:
    dest: Path
    template_name: str
    # The input name to use for the template.
    # Self looks into the clan flake itself.
    # Most people would set it to "clan" or "clan-core"
    # This must be refactored before merging, to allow using templates from clan-core by default.
    # Since this is the most common use case.
    input_name: str | None = None

    src_flake: Flake | None = None
    setup_git: bool = True
    initial: InventorySnapshot | None = None
    update_clan: bool = True


def git_command(directory: Path, *args: str) -> list[str]:
    return nix_shell(["git"], ["git", "-C", str(directory), *args])


@API.register
def create_clan(opts: CreateOptions) -> None:
    dest = opts.dest.resolve()

    if opts.src_flake is not None:
        try:
            nix_metadata(str(opts.src_flake))
        except ClanError:
            log.error(
                f"Found a repository, but it is not a valid flake: {opts.src_flake}"
            )
            log.warning("Setting src_flake to None")
            opts.src_flake = None

    template = get_template(
        TemplateName(opts.template_name),
        "clan",
        input_name=opts.input_name,
        clan_dir=opts.src_flake,
    )
    log.info(f"Found template '{template.name}' in '{template.input_variant}'")

    if dest.exists():
        dest /= template.name

    if dest.exists():
        msg = f"Destination directory {dest} already exists"
        raise ClanError(msg)

    src = Path(template.src["path"])

    copy_from_nixstore(src, dest)

    if opts.setup_git:
        run(git_command(dest, "init"))
        run(git_command(dest, "add", "."))

        # check if username is set
        has_username = run(
            git_command(dest, "config", "user.name"), RunOpts(check=False)
        )
        if has_username.returncode != 0:
            run(git_command(dest, "config", "user.name", "clan-tool"))

        has_username = run(
            git_command(dest, "config", "user.email"), RunOpts(check=False)
        )
        if has_username.returncode != 0:
            run(git_command(dest, "config", "user.email", "clan@example.com"))

    if opts.update_clan:
        run(nix_command(["flake", "update"]), RunOpts(cwd=dest))

    if opts.initial:
        inventory_store = InventoryStore(flake=Flake(str(opts.dest)))
        inventory_store.write(opts.initial, message="Init inventory")

    return
