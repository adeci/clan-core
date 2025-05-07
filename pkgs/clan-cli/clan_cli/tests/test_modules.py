import json
import subprocess
from typing import TYPE_CHECKING

import pytest
from clan_cli.flake import Flake
from clan_cli.inventory import (
    Inventory,
    Machine,
    MachineDeploy,
    set_inventory,
)
from clan_cli.machines.create import CreateOptions, create_machine
from clan_cli.nix import nix_eval, run_no_stdout
from clan_cli.tests.fixtures_flakes import FlakeForTest
from clan_lib.api.modules import list_modules

if TYPE_CHECKING:
    from .age_keys import KeyPair

from clan_cli.machines.machines import Machine as MachineMachine
from clan_cli.tests.helpers import cli


@pytest.mark.with_core
def test_list_modules(test_flake_with_core: FlakeForTest) -> None:
    base_path = test_flake_with_core.path
    modules_info = list_modules(str(base_path))

    assert len(modules_info.items()) > 1
    # Random test for those two modules
    assert "borgbackup" in modules_info
    assert "syncthing" in modules_info


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

        inventory: Inventory = {}

        inventory["services"] = {
            "borgbackup": {
                "borg1": {
                    "meta": {"name": "borg1"},
                    "roles": {
                        "client": {"machines": ["machine1"]},
                        "server": {"machines": ["machine1"]},
                    },
                }
            }
        }

        set_inventory(inventory, Flake(str(base_path)), "Add borgbackup service")

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

        generator = None

        for gen in machine.vars_generators:
            if gen.name == "borgbackup":
                generator = gen
                break

        assert generator

        ssh_key = machine.public_vars_store.get(generator, "borgbackup.ssh.pub")

        cmd = nix_eval(
            [
                f"{base_path}#nixosConfigurations.machine1.config.services.borgbackup.repos",
                "--json",
            ]
        )
        proc = run_no_stdout(cmd)
        res = json.loads(proc.stdout.strip())

        assert res["machine1"]["authorizedKeys"] == [ssh_key.decode()]
