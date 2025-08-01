import json
import subprocess
from typing import TYPE_CHECKING

import pytest
from clan_cli.machines.create import CreateOptions, create_machine
from clan_cli.tests.fixtures_flakes import FlakeForTest
from clan_lib.flake import Flake
from clan_lib.nix import nix_eval, run
from clan_lib.nix_models.clan import (
    InventoryMachine as Machine,
)
from clan_lib.nix_models.clan import (
    InventoryMachineDeploy as MachineDeploy,
)
from clan_lib.persist.inventory_store import InventoryStore
from clan_lib.persist.util import set_value_by_path
from clan_lib.services.modules import list_service_modules

if TYPE_CHECKING:
    from .age_keys import KeyPair

from clan_cli.tests.helpers import cli
from clan_lib.machines.machines import Machine as MachineMachine


@pytest.mark.with_core
def test_list_modules(test_flake_with_core: FlakeForTest) -> None:
    base_path = test_flake_with_core.path
    modules_info = list_service_modules(Flake(str(base_path)))

    assert "modules" in modules_info


@pytest.mark.impure
def test_add_module_to_inventory(
    monkeypatch: pytest.MonkeyPatch,
    test_flake_with_core: FlakeForTest,
    age_keys: list["KeyPair"],
) -> None:
    base_path = test_flake_with_core.path

    with monkeypatch.context():
        monkeypatch.chdir(test_flake_with_core.path)
        monkeypatch.setenv("SOPS_AGE_KEY", age_keys[0].privkey)

        cli.run(
            [
                "secrets",
                "users",
                "add",
                "--flake",
                str(test_flake_with_core.path),
                "user1",
                age_keys[0].pubkey,
            ]
        )
        opts = CreateOptions(
            clan_dir=Flake(str(base_path)),
            machine=Machine(name="machine1", tags=[], deploy=MachineDeploy()),
        )

        create_machine(opts)
        (
            test_flake_with_core.path / "machines" / "machine1" / "facter.json"
        ).write_text(
            json.dumps(
                {
                    "version": 1,
                    "system": "x86_64-linux",
                }
            )
        )
        subprocess.run(["git", "add", "."], cwd=test_flake_with_core.path, check=True)

        inventory_store = InventoryStore(Flake(str(test_flake_with_core.path)))
        inventory = inventory_store.read()

        set_value_by_path(
            inventory,
            "services",
            {
                "borgbackup": {
                    "borg1": {
                        "meta": {"name": "borg1"},
                        "roles": {
                            "client": {"machines": ["machine1"]},
                            "server": {"machines": ["machine1"]},
                        },
                    }
                }
            },
        )

        inventory_store.write(
            inventory,
            message="Add borgbackup service",
            commit=True,
        )

        # cmd = ["facts", "generate", "--flake", str(test_flake_with_core.path), "machine1"]
        cmd = [
            "vars",
            "generate",
            "--flake",
            str(test_flake_with_core.path),
            "machine1",
        ]

        cli.run(cmd)

        machine = MachineMachine(
            name="machine1", flake=Flake(str(test_flake_with_core.path))
        )

        from clan_cli.vars.generate import Generator

        generator = None

        generators = Generator.generators_from_flake(machine.name, machine.flake)
        for gen in generators:
            if gen.name == "borgbackup":
                generator = gen
                break

        assert generator, "Borgbackup generator not found"

        ssh_key = machine.public_vars_store.get(generator, "borgbackup.ssh.pub")

        cmd = nix_eval(
            [
                f"{base_path}#nixosConfigurations.machine1.config.services.borgbackup.repos",
                "--json",
            ]
        )
        proc = run(cmd)
        res = json.loads(proc.stdout.strip())

        assert res["machine1"]["authorizedKeys"] == [ssh_key.decode()]
