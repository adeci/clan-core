import logging
import os
import sys
from enum import Enum
from pathlib import Path

from .errors import ClanError

log = logging.getLogger(__name__)


def get_clan_flake_toplevel_or_env() -> Path | None:
    if clan_dir := os.environ.get("CLAN_DIR"):
        return Path(clan_dir)
    return get_clan_flake_toplevel()


def get_clan_flake_toplevel() -> Path | None:
    return find_toplevel([".clan-flake", ".git", ".hg", ".svn", "flake.nix"])


def find_git_repo_root() -> Path | None:
    return find_toplevel([".git"])


def find_toplevel(top_level_files: list[str]) -> Path | None:
    """Returns the path to the toplevel of the clan flake"""
    for project_file in top_level_files:
        initial_path = Path.cwd()
        path = Path(initial_path)
        while path.parent != path:
            if (path / project_file).exists():
                return path
            path = path.parent
    return None


class TemplateType(Enum):
    CLAN = "clan"
    DISK = "disk"
    MACHINE = "machine"


def clan_templates(template_type: TemplateType | None = None) -> Path:
    template_path = module_root().parent.parent.parent / "templates"

    if template_type is not None:
        template_path /= template_type.value

    if template_path.exists():
        return template_path

    template_path = module_root() / "templates"

    if template_type is not None:
        template_path /= template_type.value

    if not template_path.exists():
        msg = f"BUG! clan core not found at {template_path}. This is an issue with packaging the cli"
        raise ClanError(msg)

    return template_path


def user_config_dir() -> Path:
    if sys.platform == "win32":
        return Path(os.getenv("APPDATA", Path("~\\AppData\\Roaming\\").expanduser()))
    xdg_config = os.getenv("XDG_CONFIG_HOME")
    if xdg_config:
        return Path(xdg_config)
    if sys.platform == "darwin":
        return Path("~/Library/Application Support/").expanduser()
    return Path("~/.config").expanduser()


def user_data_dir() -> Path:
    if sys.platform == "win32":
        return Path(
            Path(os.getenv("LOCALAPPDATA", Path("~\\AppData\\Local\\").expanduser()))
        )
    xdg_data = os.getenv("XDG_DATA_HOME")
    if xdg_data:
        return Path(xdg_data)
    if sys.platform == "darwin":
        return Path("~/Library/Application Support/").expanduser()
    return Path("~/.local/share").expanduser()


def user_cache_dir() -> Path:
    if sys.platform == "win32":
        return Path(
            Path(os.getenv("LOCALAPPDATA", Path("~\\AppData\\Local\\").expanduser()))
        )
    xdg_cache = os.getenv("XDG_CACHE_HOME")
    if xdg_cache:
        return Path(xdg_cache)
    if sys.platform == "darwin":
        return Path("~/Library/Caches/").expanduser()
    return Path("~/.cache").expanduser()


def user_gcroot_dir() -> Path:
    p = user_config_dir() / "clan" / "gcroots"
    p.mkdir(parents=True, exist_ok=True)
    return p


def user_history_file() -> Path:
    return user_config_dir() / "clan" / "history"


def module_root() -> Path:
    return Path(__file__).parent


def nixpkgs_flake() -> Path:
    return (module_root() / "nixpkgs").resolve()


def nixpkgs_source() -> Path:
    return (module_root() / "nixpkgs" / "path").resolve()


def select_source() -> Path:
    return (module_root() / "select").resolve()
