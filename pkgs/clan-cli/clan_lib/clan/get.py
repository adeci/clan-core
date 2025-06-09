import json
from pathlib import Path
from urllib.parse import urlparse

from clan_lib.api import API
from clan_lib.cmd import run
from clan_lib.errors import ClanCmdError, ClanError
from clan_lib.flake import Flake
from clan_lib.nix import nix_eval
from clan_lib.nix_models.clan import InventoryMeta as Meta


@API.register
def show_clan_meta(flake: Flake) -> Meta:
    if flake.is_local and not flake.path.exists():
        msg = f"Path {flake} does not exist"
        raise ClanError(msg, description="clan directory does not exist")
    cmd = nix_eval(
        [
            f"{flake}#clanInternals.inventory.meta",
            "--json",
        ]
    )
    res = "{}"

    try:
        proc = run(cmd)
        res = proc.stdout.strip()
    except ClanCmdError as e:
        msg = "Evaluation failed on meta attribute"
        raise ClanError(
            msg,
            location=f"show_clan {flake}",
            description=str(e.cmd),
        ) from e

    clan_meta = json.loads(res)

    # Check if icon is a URL such as http:// or https://
    # Check if icon is an relative path
    # All other schemas such as file://, ftp:// are not yet supported.
    icon_path: str | None = None
    if meta_icon := clan_meta.get("icon"):
        scheme = urlparse(meta_icon).scheme
        if scheme in ["http", "https"]:
            icon_path = meta_icon
        elif scheme in [""]:
            if Path(meta_icon).is_absolute():
                msg = "Invalid absolute path"
                raise ClanError(
                    msg,
                    location=f"show_clan {flake}",
                    description="Icon path must be a URL or a relative path",
                )

            icon_path = str((flake.path / meta_icon).resolve())
        else:
            msg = "Invalid schema"
            raise ClanError(
                msg,
                location=f"show_clan {flake}",
                description="Icon path must be a URL or a relative path",
            )

    return Meta(
        {
            "name": clan_meta.get("name"),
            "description": clan_meta.get("description"),
            "icon": icon_path if icon_path else "",
        }
    )
