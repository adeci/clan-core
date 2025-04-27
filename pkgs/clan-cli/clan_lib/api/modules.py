import json
import re
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, TypedDict

from clan_cli.cmd import run_no_stdout
from clan_cli.errors import ClanCmdError, ClanError
from clan_cli.nix import nix_eval

from . import API


class CategoryInfo(TypedDict):
    color: str
    description: str


@dataclass
class Frontmatter:
    description: str
    categories: list[str] = field(default_factory=lambda: ["Uncategorized"])
    features: list[str] = field(default_factory=list)
    constraints: dict[str, Any] = field(default_factory=dict)

    @property
    def categories_info(self) -> dict[str, CategoryInfo]:
        category_map: dict[str, CategoryInfo] = {
            "AudioVideo": {
                "color": "#AEC6CF",
                "description": "Applications for presenting, creating, or processing multimedia (audio/video)",
            },
            "Audio": {"color": "#CFCFC4", "description": "Audio"},
            "Video": {"color": "#FFD1DC", "description": "Video"},
            "Development": {"color": "#F49AC2", "description": "Development"},
            "Education": {"color": "#B39EB5", "description": "Education"},
            "Game": {"color": "#FFB347", "description": "Game"},
            "Graphics": {"color": "#FF6961", "description": "Graphics"},
            "Social": {"color": "#76D7C4", "description": "Social"},
            "Network": {"color": "#77DD77", "description": "Network"},
            "Office": {"color": "#85C1E9", "description": "Office"},
            "Science": {"color": "#779ECB", "description": "Science"},
            "System": {"color": "#F5C3C0", "description": "System"},
            "Settings": {"color": "#03C03C", "description": "Settings"},
            "Utility": {"color": "#B19CD9", "description": "Utility"},
            "Uncategorized": {"color": "#C23B22", "description": "Uncategorized"},
        }

        return category_map

    def __post_init__(self) -> None:
        for category in self.categories:
            if category not in self.categories_info:
                msg = f"Invalid category: {category}"
                raise ValueError(msg)


def parse_frontmatter(readme_content: str) -> tuple[dict[str, Any] | None, str]:
    """
    Extracts TOML frontmatter from a string

    Raises:
    - ClanError: If the toml frontmatter is invalid
    """
    # Pattern to match YAML frontmatter enclosed by triple-dashed lines
    frontmatter_pattern = r"^---\s+(.*?)\s+---\s?+(.*)$"

    # Search for the frontmatter using the pattern
    match = re.search(frontmatter_pattern, readme_content, re.DOTALL)

    # If a match is found, return the frontmatter content
    match = re.search(frontmatter_pattern, readme_content, re.DOTALL)

    # If a match is found, parse the TOML frontmatter and return both parts
    if match:
        frontmatter_raw, remaining_content = match.groups()
        try:
            # Parse the TOML frontmatter
            frontmatter_parsed = tomllib.loads(frontmatter_raw)
        except tomllib.TOMLDecodeError as e:
            msg = f"Error parsing TOML frontmatter: {e}"
            raise ClanError(
                msg,
                description="Invalid TOML frontmatter",
                location="extract_frontmatter",
            ) from e

        return frontmatter_parsed, remaining_content
    return None, readme_content


def extract_frontmatter(readme_content: str, err_scope: str) -> tuple[Frontmatter, str]:
    """
    Extracts TOML frontmatter from a README file content.

    Parameters:
    - readme_content (str): The content of the README file as a string.

    Returns:
    - str: The extracted frontmatter as a string.
    - str: The content of the README file without the frontmatter.

    Raises:
    - ValueError: If the README does not contain valid frontmatter.
    """
    frontmatter_raw, remaining_content = parse_frontmatter(readme_content)

    if frontmatter_raw:
        return Frontmatter(**frontmatter_raw), remaining_content

    # If no frontmatter is found, raise an error
    msg = "Invalid README: Frontmatter not found."
    raise ClanError(
        msg,
        location="extract_frontmatter",
        description=f"{err_scope} does not contain valid frontmatter.",
    )


def has_inventory_feature(module_path: Path) -> bool:
    readme_file = module_path / "README.md"
    if not readme_file.exists():
        return False
    with readme_file.open() as f:
        readme = f.read()
        frontmatter, _ = extract_frontmatter(readme, f"{module_path}")
        return "inventory" in frontmatter.features


def get_roles(module_path: Path) -> None | list[str]:
    if not has_inventory_feature(module_path):
        return None

    roles_dir = module_path / "roles"
    if not roles_dir.exists() or not roles_dir.is_dir():
        return []

    return [
        role.stem  # filename without .nix extension
        for role in roles_dir.iterdir()
        if role.is_file() and role.suffix == ".nix"
    ]


@dataclass
class ModuleInfo:
    description: str
    readme: str
    categories: list[str]
    roles: list[str] | None
    features: list[str] = field(default_factory=list)
    constraints: dict[str, Any] = field(default_factory=dict)


def get_modules(base_path: str) -> dict[str, str]:
    cmd = nix_eval(
        [
            f"{base_path}#clanInternals.inventory.modules",
            "--json",
        ]
    )
    try:
        proc = run_no_stdout(cmd)
        res = proc.stdout.strip()
    except ClanCmdError as e:
        msg = "clanInternals might not have inventory.modules attributes"
        raise ClanError(
            msg,
            location=f"list_modules {base_path}",
            description="Evaluation failed on clanInternals.inventory.modules attribute",
        ) from e
    modules: dict[str, str] = json.loads(res)
    return modules


@API.register
def list_modules(base_path: str) -> dict[str, ModuleInfo]:
    """
    Show information about a module
    """
    modules = get_modules(base_path)
    return {
        module_name: get_module_info(module_name, Path(module_path))
        for module_name, module_path in modules.items()
    }


def get_module_info(
    module_name: str,
    module_path: Path,
) -> ModuleInfo:
    """
    Retrieves information about a module
    """
    if not module_path.exists():
        msg = "Module not found"
        raise ClanError(
            msg,
            location=f"show_module_info {module_name}",
            description="Module does not exist",
        )
    module_readme = module_path / "README.md"
    if not module_readme.exists():
        msg = "Module not found"
        raise ClanError(
            msg,
            location=f"show_module_info {module_name}",
            description="Module does not exist or doesn't have any README.md file",
        )
    with module_readme.open() as f:
        readme = f.read()
        frontmatter, readme_content = extract_frontmatter(
            readme, f"{module_path}/README.md"
        )

    return ModuleInfo(
        description=frontmatter.description,
        categories=frontmatter.categories,
        roles=get_roles(module_path),
        readme=readme_content,
        features=["inventory"] if has_inventory_feature(module_path) else [],
        constraints=frontmatter.constraints,
    )
