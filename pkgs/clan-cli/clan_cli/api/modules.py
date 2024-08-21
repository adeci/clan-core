import json
import re
import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Any, get_args, get_type_hints

from clan_cli.cmd import run_no_stdout
from clan_cli.errors import ClanCmdError, ClanError
from clan_cli.inventory import Inventory, load_inventory_json, save_inventory
from clan_cli.inventory.classes import Service
from clan_cli.nix import nix_eval

from . import API
from .serde import from_dict


@dataclass
class Frontmatter:
    description: str
    categories: list[str] | None = None


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
            raise ClanError(
                f"Error parsing TOML frontmatter: {e}",
                description=f"Invalid TOML frontmatter. {err_scope}",
                location="extract_frontmatter",
            )

        return Frontmatter(**frontmatter_parsed), remaining_content

    # If no frontmatter is found, raise an error
    raise ClanError(
        "Invalid README: Frontmatter not found.",
        location="extract_frontmatter",
        description=f"{err_scope} does not contain valid frontmatter.",
    )


def get_roles(module_path: str) -> None | list[str]:
    roles_dir = Path(module_path) / "roles"
    if not roles_dir.exists() or not roles_dir.is_dir():
        return None

    return [
        role.stem  # filename without .nix extension
        for role in roles_dir.iterdir()
        if role.is_file() and role.suffix == ".nix"
    ]


@dataclass
class ModuleInfo:
    description: str
    categories: list[str] | None
    roles: list[str] | None
    readme: str | None = None


def get_modules(base_path: str) -> dict[str, str]:
    cmd = nix_eval(
        [
            f"{base_path}#clanInternals.clanModules",
            "--json",
        ]
    )
    try:
        proc = run_no_stdout(cmd)
        res = proc.stdout.strip()
    except ClanCmdError:
        raise ClanError(
            "clanInternals might not have clanModules attributes",
            location=f"list_modules {base_path}",
            description="Evaluation failed on clanInternals.clanModules attribute",
        )
    modules: dict[str, str] = json.loads(res)
    return modules


@API.register
def list_modules(base_path: str) -> dict[str, ModuleInfo]:
    """
    Show information about a module
    """
    modules = get_modules(base_path)
    return {
        module_name: get_module_info(module_name, module_path)
        for module_name, module_path in modules.items()
    }


def get_module_info(
    module_name: str,
    module_path: str,
) -> ModuleInfo:
    """
    Retrieves information about a module
    """
    if not module_path:
        raise ClanError(
            "Module not found",
            location=f"show_module_info {module_name}",
            description="Module does not exist",
        )
    module_readme = Path(module_path) / "README.md"
    if not module_readme.exists():
        raise ClanError(
            "Module not found",
            location=f"show_module_info {module_name}",
            description="Module does not exist or doesn't have any README.md file",
        )
    with open(module_readme) as f:
        readme = f.read()
        frontmatter, readme_content = extract_frontmatter(
            readme, f"{module_path}/README.md"
        )

    return ModuleInfo(
        description=frontmatter.description,
        categories=frontmatter.categories,
        roles=get_roles(module_path),
        readme=readme_content,
    )


@API.register
def get_inventory(base_path: str) -> Inventory:
    return load_inventory_json(base_path)


@API.register
def set_service_instance(
    base_path: str, module_name: str, instance_name: str, config: dict[str, Any]
) -> None:
    """
    A function that allows to set any service instance in the inventory.
    Takes any untyped dict. The dict is then checked and converted into the correct type using the type hints of the service.
    If any conversion error occurs, the function will raise an error.
    """
    service_keys = get_type_hints(Service).keys()

    if module_name not in service_keys:
        raise ValueError(
            f"{module_name} is not a valid Service attribute. Expected one of {', '.join(service_keys)}."
        )

    inventory = load_inventory_json(base_path)
    target_type = get_args(get_type_hints(Service)[module_name])[1]

    module_instance_map: dict[str, Any] = getattr(inventory.services, module_name, {})

    module_instance_map[instance_name] = from_dict(target_type, config)

    setattr(inventory.services, module_name, module_instance_map)

    save_inventory(
        inventory, base_path, f"Update {module_name} instance {instance_name}"
    )

    # TODO: Add a check that rolls back the inventory if the service config is not valid or causes conflicts.
