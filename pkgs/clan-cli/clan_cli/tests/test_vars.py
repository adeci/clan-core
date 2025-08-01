import json
import logging
import shutil
from pathlib import Path

import pytest
from clan_cli.tests.age_keys import SopsSetup
from clan_cli.tests.fixtures_flakes import ClanFlake
from clan_cli.tests.helpers import cli
from clan_cli.vars.check import check_vars
from clan_cli.vars.generate import (
    Generator,
    create_machine_vars_interactive,
    get_generators,
    run_generators,
)
from clan_cli.vars.get import get_machine_var
from clan_cli.vars.graph import all_missing_closure, requested_closure
from clan_cli.vars.list import stringify_all_vars
from clan_cli.vars.public_modules import in_repo
from clan_cli.vars.secret_modules import password_store, sops
from clan_cli.vars.set import set_var
from clan_lib.errors import ClanError
from clan_lib.flake import Flake
from clan_lib.machines.machines import Machine
from clan_lib.nix import nix_eval, run


def test_dependencies_as_files(temp_dir: Path) -> None:
    from clan_cli.vars.generate import dependencies_as_dir

    decrypted_dependencies = {
        "gen_1": {
            "var_1a": b"var_1a",
            "var_1b": b"var_1b",
        },
        "gen_2": {
            "var_2a": b"var_2a",
            "var_2b": b"var_2b",
        },
    }
    dependencies_as_dir(decrypted_dependencies, temp_dir)
    assert temp_dir.is_dir()
    assert (temp_dir / "gen_1" / "var_1a").read_bytes() == b"var_1a"
    assert (temp_dir / "gen_1" / "var_1b").read_bytes() == b"var_1b"
    assert (temp_dir / "gen_2" / "var_2a").read_bytes() == b"var_2a"
    assert (temp_dir / "gen_2" / "var_2b").read_bytes() == b"var_2b"
    # ensure the files are not world readable
    assert (temp_dir / "gen_1" / "var_1a").stat().st_mode & 0o777 == 0o600
    assert (temp_dir / "gen_1" / "var_1b").stat().st_mode & 0o777 == 0o600
    assert (temp_dir / "gen_2" / "var_2a").stat().st_mode & 0o777 == 0o600
    assert (temp_dir / "gen_2" / "var_2b").stat().st_mode & 0o777 == 0o600


def test_required_generators() -> None:
    gen_1 = Generator(name="gen_1", dependencies=[])
    gen_2 = Generator(name="gen_2", dependencies=["gen_1"])
    gen_2a = Generator(name="gen_2a", dependencies=["gen_2"])
    gen_2b = Generator(name="gen_2b", dependencies=["gen_2"])

    gen_1.exists = True
    gen_2.exists = False
    gen_2a.exists = False
    gen_2b.exists = True
    generators = {
        generator.name: generator for generator in [gen_1, gen_2, gen_2a, gen_2b]
    }

    def generator_names(generator: list[Generator]) -> list[str]:
        return [gen.name for gen in generator]

    assert generator_names(requested_closure(["gen_1"], generators)) == [
        "gen_1",
        "gen_2",
        "gen_2a",
        "gen_2b",
    ]
    assert generator_names(requested_closure(["gen_2"], generators)) == [
        "gen_2",
        "gen_2a",
        "gen_2b",
    ]
    assert generator_names(requested_closure(["gen_2a"], generators)) == [
        "gen_2",
        "gen_2a",
        "gen_2b",
    ]
    assert generator_names(requested_closure(["gen_2b"], generators)) == [
        "gen_2",
        "gen_2a",
        "gen_2b",
    ]

    assert generator_names(all_missing_closure(generators)) == [
        "gen_2",
        "gen_2a",
        "gen_2b",
    ]


@pytest.mark.with_core
def test_generate_public_and_secret_vars(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    flake = flake_with_sops

    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["my_value"]["secret"] = False
    my_generator["files"]["my_secret"]["secret"] = True
    my_generator["script"] = (
        'echo -n public > "$out"/my_value; echo -n secret > "$out"/my_secret; echo -n non-default > "$out"/value_with_default'
    )

    my_generator["files"]["value_with_default"]["secret"] = False
    my_generator["files"]["value_with_default"]["value"]["_type"] = "override"
    my_generator["files"]["value_with_default"]["value"]["priority"] = 1000  # mkDefault
    my_generator["files"]["value_with_default"]["value"]["content"] = "default_value"

    my_shared_generator = config["clan"]["core"]["vars"]["generators"][
        "my_shared_generator"
    ]
    my_shared_generator["share"] = True
    my_shared_generator["files"]["my_shared_value"]["secret"] = False
    my_shared_generator["script"] = 'echo -n shared > "$out"/my_shared_value'

    dependent_generator = config["clan"]["core"]["vars"]["generators"][
        "dependent_generator"
    ]
    dependent_generator["share"] = False
    dependent_generator["files"]["my_secret"]["secret"] = True
    dependent_generator["dependencies"] = ["my_shared_generator"]
    dependent_generator["script"] = (
        'cat "$in"/my_shared_generator/my_shared_value > "$out"/my_secret'
    )

    flake.refresh()
    monkeypatch.chdir(flake.path)

    machine = Machine(name="my_machine", flake=Flake(str(flake.path)))
    assert not check_vars(machine.name, machine.flake)
    vars_text = stringify_all_vars(machine)
    assert "my_generator/my_value: <not set>" in vars_text
    assert "my_generator/my_secret: <not set>" in vars_text
    assert "my_shared_generator/my_shared_value: <not set>" in vars_text
    assert "dependent_generator/my_secret: <not set>" in vars_text

    # ensure evaluating the default value works without generating the value
    value_non_default = run(
        nix_eval(
            [
                f"{flake.path}#nixosConfigurations.my_machine.config.clan.core.vars.generators.my_generator.files.value_with_default.value",
            ]
        )
    ).stdout.strip()
    assert json.loads(value_non_default) == "default_value"

    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    assert check_vars(machine.name, machine.flake)
    # get last commit message
    commit_message = run(
        ["git", "log", "-5", "--pretty=%B"],
    ).stdout.strip()
    assert (
        "Update vars via generator my_generator for machine my_machine"
        in commit_message
    )
    assert (
        "Update vars via generator my_shared_generator for machine my_machine"
        in commit_message
    )
    assert (
        get_machine_var(
            str(machine.flake.path), machine.name, "my_generator/my_value"
        ).printable_value
        == "public"
    )
    assert (
        get_machine_var(
            str(machine.flake.path), machine.name, "my_shared_generator/my_shared_value"
        ).printable_value
        == "shared"
    )
    vars_text = stringify_all_vars(machine)
    flake_obj = Flake(str(flake.path))
    my_generator = Generator("my_generator", machine="my_machine", _flake=flake_obj)
    dependent_generator = Generator(
        "dependent_generator", machine="my_machine", _flake=flake_obj
    )
    in_repo_store = in_repo.FactStore(flake=flake_obj)
    assert not in_repo_store.exists(my_generator, "my_secret")
    sops_store = sops.SecretStore(flake=flake_obj)
    assert sops_store.exists(my_generator, "my_secret")
    assert sops_store.get(my_generator, "my_secret").decode() == "secret"
    assert sops_store.exists(dependent_generator, "my_secret")
    assert sops_store.get(dependent_generator, "my_secret").decode() == "shared"

    assert "my_generator/my_value: public" in vars_text
    assert "my_generator/my_secret" in vars_text
    vars_eval = run(
        nix_eval(
            [
                f"{flake.path}#nixosConfigurations.my_machine.config.clan.core.vars.generators.my_generator.files.my_value.value",
            ]
        )
    ).stdout.strip()
    assert json.loads(vars_eval) == "public"

    value_non_default = run(
        nix_eval(
            [
                f"{flake.path}#nixosConfigurations.my_machine.config.clan.core.vars.generators.my_generator.files.value_with_default.value",
            ]
        )
    ).stdout.strip()
    assert json.loads(value_non_default) == "non-default"
    # test regeneration works
    cli.run(
        ["vars", "generate", "--flake", str(flake.path), "my_machine", "--regenerate"]
    )
    # test regeneration without sandbox
    cli.run(
        [
            "vars",
            "generate",
            "--flake",
            str(flake.path),
            "my_machine",
            "--regenerate",
            "--no-sandbox",
        ]
    )


# TODO: it doesn't actually test if the group has access
@pytest.mark.with_core
def test_generate_secret_var_sops_with_default_group(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
    sops_setup: SopsSetup,
) -> None:
    flake = flake_with_sops

    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    config["clan"]["core"]["sops"]["defaultGroups"] = ["my_group"]
    first_generator = config["clan"]["core"]["vars"]["generators"]["first_generator"]
    first_generator["files"]["my_secret"]["secret"] = True
    first_generator["files"]["my_public"]["secret"] = False
    first_generator["script"] = (
        'echo hello > "$out"/my_secret && echo hello > "$out"/my_public'
    )
    second_generator = config["clan"]["core"]["vars"]["generators"]["second_generator"]
    second_generator["files"]["my_secret"]["secret"] = True
    second_generator["files"]["my_public"]["secret"] = False
    second_generator["script"] = (
        'echo hello > "$out"/my_secret && echo hello > "$out"/my_public'
    )
    flake.refresh()
    monkeypatch.chdir(flake.path)
    cli.run(["secrets", "groups", "add-user", "my_group", sops_setup.user])
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    flake_obj = Flake(str(flake.path))
    first_generator = Generator(
        "first_generator", machine="my_machine", _flake=flake_obj
    )
    second_generator = Generator(
        "second_generator", machine="my_machine", _flake=flake_obj
    )
    in_repo_store = in_repo.FactStore(flake=flake_obj)
    assert not in_repo_store.exists(first_generator, "my_secret")
    sops_store = sops.SecretStore(flake=flake_obj)
    assert sops_store.exists(first_generator, "my_secret")
    assert sops_store.get(first_generator, "my_secret").decode() == "hello\n"
    assert sops_store.exists(second_generator, "my_secret")
    assert sops_store.get(second_generator, "my_secret").decode() == "hello\n"

    # add another user to the group and check if secret gets re-encrypted
    pubkey_user2 = sops_setup.keys[1]
    cli.run(
        [
            "secrets",
            "users",
            "add",
            "--flake",
            str(flake.path),
            "user2",
            pubkey_user2.pubkey,
        ]
    )
    cli.run(["secrets", "groups", "add-user", "my_group", "user2"])
    # check if new user can access the secret
    monkeypatch.setenv("USER", "user2")
    first_generator_with_share = Generator(
        "first_generator", share=False, machine="my_machine", _flake=flake_obj
    )
    second_generator_with_share = Generator(
        "second_generator", share=False, machine="my_machine", _flake=flake_obj
    )
    assert sops_store.user_has_access("user2", first_generator_with_share, "my_secret")
    assert sops_store.user_has_access("user2", second_generator_with_share, "my_secret")

    # Rotate key of a user
    pubkey_user3 = sops_setup.keys[2]
    cli.run(
        [
            "secrets",
            "users",
            "add",
            "--flake",
            str(flake.path),
            "--force",
            "user2",
            pubkey_user3.pubkey,
        ]
    )
    monkeypatch.setenv("USER", "user2")
    assert sops_store.user_has_access("user2", first_generator_with_share, "my_secret")
    assert sops_store.user_has_access("user2", second_generator_with_share, "my_secret")


@pytest.mark.with_core
def test_generated_shared_secret_sops(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    flake = flake_with_sops

    m1_config = flake.machines["machine1"]
    m1_config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    shared_generator = m1_config["clan"]["core"]["vars"]["generators"][
        "my_shared_generator"
    ]
    shared_generator["share"] = True
    shared_generator["files"]["my_shared_secret"]["secret"] = True
    shared_generator["script"] = 'echo hello > "$out"/my_shared_secret'
    m2_config = flake.machines["machine2"]
    m2_config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    m2_config["clan"]["core"]["vars"]["generators"]["my_shared_generator"] = (
        shared_generator.copy()
    )
    flake.refresh()
    monkeypatch.chdir(flake.path)
    machine1 = Machine(name="machine1", flake=Flake(str(flake.path)))
    machine2 = Machine(name="machine2", flake=Flake(str(flake.path)))
    cli.run(["vars", "generate", "--flake", str(flake.path), "machine1"])
    assert check_vars(machine1.name, machine1.flake)
    cli.run(["vars", "generate", "--flake", str(flake.path), "machine2"])
    assert check_vars(machine2.name, machine2.flake)
    assert check_vars(machine2.name, machine2.flake)
    m1_sops_store = sops.SecretStore(machine1.flake)
    m2_sops_store = sops.SecretStore(machine2.flake)
    # Create generators with machine context for testing
    generator_m1 = Generator(
        "my_shared_generator", share=True, machine="machine1", _flake=machine1.flake
    )
    generator_m2 = Generator(
        "my_shared_generator", share=True, machine="machine2", _flake=machine2.flake
    )

    assert m1_sops_store.exists(generator_m1, "my_shared_secret")
    assert m2_sops_store.exists(generator_m2, "my_shared_secret")
    assert m1_sops_store.machine_has_access(generator_m1, "my_shared_secret")
    assert m2_sops_store.machine_has_access(generator_m2, "my_shared_secret")


@pytest.mark.with_core
def test_generate_secret_var_password_store(
    monkeypatch: pytest.MonkeyPatch,
    flake: ClanFlake,
    test_root: Path,
) -> None:
    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    clan_vars = config["clan"]["core"]["vars"]
    clan_vars["settings"]["secretStore"] = "password-store"
    # Create a second secret so that when we delete the first one,
    # we still have the second one to test `delete_store`:
    my_generator = clan_vars["generators"]["my_generator"]
    my_generator["files"]["my_secret"]["secret"] = True
    my_generator["script"] = 'echo hello > "$out"/my_secret'
    my_generator2 = clan_vars["generators"]["my_generator2"]
    my_generator2["files"]["my_secret2"]["secret"] = True
    my_generator2["script"] = 'echo world > "$out"/my_secret2'
    my_shared_generator = clan_vars["generators"]["my_shared_generator"]
    my_shared_generator["share"] = True
    my_shared_generator["files"]["my_shared_secret"]["secret"] = True
    my_shared_generator["script"] = 'echo hello > "$out"/my_shared_secret'
    flake.refresh()
    monkeypatch.chdir(flake.path)
    gnupghome = flake.path / "gpg"
    shutil.copytree(test_root / "data" / "gnupg-home", gnupghome)
    monkeypatch.setenv("GNUPGHOME", str(gnupghome))

    password_store_dir = flake.path / "pass"
    shutil.copytree(test_root / "data" / "password-store", password_store_dir)
    monkeypatch.setenv("PASSWORD_STORE_DIR", str(password_store_dir))

    # Initialize password store as a git repository
    import subprocess

    subprocess.run(["git", "init"], cwd=password_store_dir, check=True)
    subprocess.run(
        ["git", "config", "user.email", "test@example.com"],
        cwd=password_store_dir,
        check=True,
    )
    subprocess.run(
        ["git", "config", "user.name", "Test User"], cwd=password_store_dir, check=True
    )

    flake_obj = Flake(str(flake.path))
    machine = Machine(name="my_machine", flake=flake_obj)
    assert not check_vars(machine.name, machine.flake)
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    assert check_vars(machine.name, machine.flake)
    store = password_store.SecretStore(flake=flake_obj)
    my_generator = Generator(
        "my_generator", share=False, files=[], machine="my_machine", _flake=flake_obj
    )
    my_generator_shared = Generator(
        "my_generator", share=True, files=[], machine="my_machine", _flake=flake_obj
    )
    my_shared_generator = Generator(
        "my_shared_generator",
        share=True,
        files=[],
        machine="my_machine",
        _flake=flake_obj,
    )
    my_shared_generator_not_shared = Generator(
        "my_shared_generator",
        share=False,
        files=[],
        machine="my_machine",
        _flake=flake_obj,
    )
    assert store.exists(my_generator, "my_secret")
    assert not store.exists(my_generator_shared, "my_secret")
    assert store.exists(my_shared_generator, "my_shared_secret")
    assert not store.exists(my_shared_generator_not_shared, "my_shared_secret")

    generator = Generator(
        name="my_generator",
        share=False,
        files=[],
        machine="my_machine",
        _flake=flake_obj,
    )
    assert store.get(generator, "my_secret").decode() == "hello\n"
    vars_text = stringify_all_vars(machine)
    assert "my_generator/my_secret" in vars_text

    my_generator = Generator(
        "my_generator", share=False, files=[], machine="my_machine", _flake=flake_obj
    )
    var_name = "my_secret"
    store.delete(my_generator, var_name)
    assert not store.exists(my_generator, var_name)

    store.delete_store("my_machine")
    store.delete_store("my_machine")  # check idempotency
    my_generator2 = Generator(
        "my_generator2", share=False, files=[], machine="my_machine", _flake=flake_obj
    )
    var_name = "my_secret2"
    assert not store.exists(my_generator2, var_name)

    # The shared secret should still be there,
    # not sure if we can delete those automatically:
    my_shared_generator = Generator(
        "my_shared_generator",
        share=True,
        files=[],
        machine="my_machine",
        _flake=flake_obj,
    )
    var_name = "my_shared_secret"
    assert store.exists(my_shared_generator, var_name)


@pytest.mark.with_core
def test_generate_secret_for_multiple_machines(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    flake = flake_with_sops

    from clan_lib.nix import nix_config

    local_system = nix_config()["system"]

    machine1_config = flake.machines["machine1"]
    machine1_config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    machine1_generator = machine1_config["clan"]["core"]["vars"]["generators"][
        "my_generator"
    ]
    machine1_generator["files"]["my_secret"]["secret"] = True
    machine1_generator["files"]["my_value"]["secret"] = False
    machine1_generator["script"] = (
        'echo machine1 > "$out"/my_secret && echo machine1 > "$out"/my_value'
    )
    machine2_config = flake.machines["machine2"]
    # Test that we can generate secrets for other platforms
    machine2_config["nixpkgs"]["hostPlatform"] = (
        "aarch64-linux" if local_system == "x86_64-linux" else "x86_64-linux"
    )

    machine2_generator = machine2_config["clan"]["core"]["vars"]["generators"][
        "my_generator"
    ]
    machine2_generator["files"]["my_secret"]["secret"] = True
    machine2_generator["files"]["my_value"]["secret"] = False
    machine2_generator["script"] = (
        'echo machine2 > "$out"/my_secret && echo machine2 > "$out"/my_value'
    )
    flake.refresh()
    monkeypatch.chdir(flake.path)
    cli.run(["vars", "generate", "--flake", str(flake.path)])
    # check if public vars have been created correctly
    flake_obj = Flake(str(flake.path))
    in_repo_store1 = in_repo.FactStore(flake=flake_obj)
    in_repo_store2 = in_repo.FactStore(flake=flake_obj)

    # Create generators for each machine
    gen1 = Generator("my_generator", machine="machine1", _flake=flake_obj)
    gen2 = Generator("my_generator", machine="machine2", _flake=flake_obj)

    assert in_repo_store1.exists(gen1, "my_value")
    assert in_repo_store2.exists(gen2, "my_value")
    assert in_repo_store1.get(gen1, "my_value").decode() == "machine1\n"
    assert in_repo_store2.get(gen2, "my_value").decode() == "machine2\n"
    # check if secret vars have been created correctly
    sops_store1 = sops.SecretStore(flake=flake_obj)
    sops_store2 = sops.SecretStore(flake=flake_obj)
    assert sops_store1.exists(gen1, "my_secret")
    assert sops_store2.exists(gen2, "my_secret")
    assert sops_store1.get(gen1, "my_secret").decode() == "machine1\n"
    assert sops_store2.get(gen2, "my_secret").decode() == "machine2\n"


@pytest.mark.with_core
def test_prompt(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    flake = flake_with_sops

    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["line_value"]["secret"] = False
    my_generator["files"]["multiline_value"]["secret"] = False

    my_generator["prompts"]["prompt1"]["description"] = "dream2nix"
    my_generator["prompts"]["prompt1"]["persist"] = False
    my_generator["prompts"]["prompt1"]["type"] = "line"

    my_generator["prompts"]["prompt2"]["description"] = "dream2nix"
    my_generator["prompts"]["prompt2"]["persist"] = False
    my_generator["prompts"]["prompt2"]["type"] = "line"

    my_generator["prompts"]["prompt_persist"]["persist"] = True

    my_generator["script"] = (
        'cat "$prompts"/prompt1 > "$out"/line_value; cat "$prompts"/prompt2 > "$out"/multiline_value'
    )
    flake.refresh()
    monkeypatch.chdir(flake.path)
    monkeypatch.setattr(
        "clan_cli.vars.prompt.MOCK_PROMPT_RESPONSE",
        iter(["line input", "my\nmultiline\ninput\n", "prompt_persist"]),
    )
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    flake_obj = Flake(str(flake.path))
    my_generator = Generator("my_generator", machine="my_machine", _flake=flake_obj)
    my_generator_with_details = Generator(
        name="my_generator",
        share=False,
        files=[],
        machine="my_machine",
        _flake=flake_obj,
    )
    in_repo_store = in_repo.FactStore(flake=flake_obj)
    assert in_repo_store.exists(my_generator, "line_value")
    assert in_repo_store.get(my_generator, "line_value").decode() == "line input"

    assert in_repo_store.exists(my_generator, "multiline_value")
    assert (
        in_repo_store.get(my_generator, "multiline_value").decode()
        == "my\nmultiline\ninput\n"
    )
    sops_store = sops.SecretStore(flake=flake_obj)
    assert sops_store.exists(my_generator_with_details, "prompt_persist")
    assert sops_store.get(my_generator, "prompt_persist").decode() == "prompt_persist"


@pytest.mark.with_core
def test_multi_machine_shared_vars(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    """
    Ensure that shared vars are regenerated only when they should, and also can be
    accessed by all machines that should have access.

    Specifically:
        - make sure shared wars are not regenerated when a second machines is added
        - make sure vars can still be accessed by all machines, after they are regenerated
    """
    flake = flake_with_sops

    machine1_config = flake.machines["machine1"]
    machine1_config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    shared_generator = machine1_config["clan"]["core"]["vars"]["generators"][
        "shared_generator"
    ]
    shared_generator["share"] = True
    shared_generator["files"]["my_secret"]["secret"] = True
    shared_generator["files"]["my_value"]["secret"] = False
    shared_generator["script"] = (
        'echo "$RANDOM" > "$out"/my_value && echo "$RANDOM" > "$out"/my_secret'
    )
    # machine 2 is equivalent to machine 1
    flake.machines["machine2"] = machine1_config
    flake.refresh()
    monkeypatch.chdir(flake.path)
    machine1 = Machine(name="machine1", flake=Flake(str(flake.path)))
    machine2 = Machine(name="machine2", flake=Flake(str(flake.path)))
    sops_store_1 = sops.SecretStore(machine1.flake)
    sops_store_2 = sops.SecretStore(machine2.flake)
    in_repo_store_1 = in_repo.FactStore(machine1.flake)
    in_repo_store_2 = in_repo.FactStore(machine2.flake)
    # Create generators with machine context for testing
    generator_m1 = Generator(
        "shared_generator", share=True, machine="machine1", _flake=machine1.flake
    )
    generator_m2 = Generator(
        "shared_generator", share=True, machine="machine2", _flake=machine2.flake
    )
    # generate for machine 1
    cli.run(["vars", "generate", "--flake", str(flake.path), "machine1"])
    # read out values for machine 1
    m1_secret = sops_store_1.get(generator_m1, "my_secret")
    m1_value = in_repo_store_1.get(generator_m1, "my_value")
    # generate for machine 2
    cli.run(["vars", "generate", "--flake", str(flake.path), "machine2"])
    # ensure values are the same for both machines
    assert sops_store_2.get(generator_m2, "my_secret") == m1_secret
    assert in_repo_store_2.get(generator_m2, "my_value") == m1_value

    # ensure shared secret stays available for all machines after regeneration
    # regenerate for machine 1
    cli.run(
        ["vars", "generate", "--flake", str(flake.path), "machine1", "--regenerate"]
    )
    # ensure values changed
    new_secret_1 = sops_store_1.get(generator_m1, "my_secret")
    new_value_1 = in_repo_store_1.get(generator_m1, "my_value")
    new_secret_2 = sops_store_2.get(generator_m2, "my_secret")
    assert new_secret_1 != m1_secret
    assert new_value_1 != m1_value
    # ensure that both machines still have access to the same secret
    assert new_secret_1 == new_secret_2
    assert sops_store_1.machine_has_access(generator_m1, "my_secret")
    assert sops_store_2.machine_has_access(generator_m2, "my_secret")


@pytest.mark.with_core
def test_api_set_prompts(
    monkeypatch: pytest.MonkeyPatch,
    flake: ClanFlake,
) -> None:
    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["prompts"]["prompt1"]["type"] = "line"
    my_generator["prompts"]["prompt1"]["persist"] = True
    my_generator["files"]["prompt1"]["secret"] = False
    flake.refresh()

    monkeypatch.chdir(flake.path)

    run_generators(
        machine_name="my_machine",
        base_dir=flake.path,
        generators=["my_generator"],
        all_prompt_values={
            "my_generator": {
                "prompt1": "input1",
            }
        },
    )
    machine = Machine(name="my_machine", flake=Flake(str(flake.path)))
    store = in_repo.FactStore(machine.flake)
    my_generator = Generator("my_generator", machine="my_machine", _flake=machine.flake)
    assert store.exists(my_generator, "prompt1")
    assert store.get(my_generator, "prompt1").decode() == "input1"
    run_generators(
        machine_name="my_machine",
        base_dir=flake.path,
        generators=["my_generator"],
        all_prompt_values={
            "my_generator": {
                "prompt1": "input2",
            }
        },
    )
    assert store.get(my_generator, "prompt1").decode() == "input2"

    generators = get_generators(
        machine_name="my_machine", base_dir=flake.path, include_previous_values=True
    )
    # get_generators should bind the store
    assert generators[0].files[0]._store is not None

    assert len(generators) == 1
    assert generators[0].name == "my_generator"
    assert generators[0].prompts[0].name == "prompt1"
    assert generators[0].prompts[0].previous_value == "input2"


@pytest.mark.with_core
def test_stdout_of_generate(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
    caplog: pytest.LogCaptureFixture,
) -> None:
    flake_ = flake_with_sops

    config = flake_.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["my_value"]["secret"] = False
    my_generator["script"] = 'echo -n hello > "$out"/my_value'
    my_secret_generator = config["clan"]["core"]["vars"]["generators"][
        "my_secret_generator"
    ]
    my_secret_generator["files"]["my_secret"]["secret"] = True
    my_secret_generator["script"] = 'echo -n hello > "$out"/my_secret'
    flake_.refresh()
    monkeypatch.chdir(flake_.path)
    flake = Flake(str(flake_.path))
    from clan_cli.vars.generate import create_machine_vars_interactive

    # with capture_output as output:
    with caplog.at_level(logging.INFO):
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=flake),
            "my_generator",
            regenerate=False,
        )

    assert "Updated var my_generator/my_value" in caplog.text
    assert "old: <not set>" in caplog.text
    assert "new: hello" in caplog.text
    caplog.clear()

    set_var("my_machine", "my_generator/my_value", b"world", flake)
    with caplog.at_level(logging.INFO):
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=flake),
            "my_generator",
            regenerate=True,
        )
    assert "Updated var my_generator/my_value" in caplog.text
    assert "old: world" in caplog.text
    assert "new: hello" in caplog.text
    caplog.clear()
    # check the output when nothing gets regenerated
    with caplog.at_level(logging.INFO):
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=flake),
            "my_generator",
            regenerate=True,
        )
    assert "Updated var" not in caplog.text
    assert "hello" in caplog.text
    caplog.clear()
    with caplog.at_level(logging.INFO):
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=flake),
            "my_secret_generator",
            regenerate=False,
        )
    assert "Updated secret var my_secret_generator/my_secret" in caplog.text
    assert "hello" not in caplog.text
    caplog.clear()
    set_var(
        "my_machine",
        "my_secret_generator/my_secret",
        b"world",
        Flake(str(flake.path)),
    )
    with caplog.at_level(logging.INFO):
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=flake),
            "my_secret_generator",
            regenerate=True,
        )
    assert "Updated secret var my_secret_generator/my_secret" in caplog.text
    assert "world" not in caplog.text
    assert "hello" not in caplog.text
    caplog.clear()


@pytest.mark.with_core
def test_migration(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
    caplog: pytest.LogCaptureFixture,
) -> None:
    flake = flake_with_sops

    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_service = config["clan"]["core"]["facts"]["services"]["my_service"]
    my_service["public"]["my_value"] = {}
    my_service["secret"]["my_secret"] = {}
    my_service["generator"]["script"] = (
        'echo -n hello > "$facts"/my_value && echo -n hello > "$secrets"/my_secret'
    )
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["my_value"]["secret"] = False
    my_generator["files"]["my_secret"]["secret"] = True
    my_generator["migrateFact"] = "my_service"
    my_generator["script"] = 'echo -n other > "$out"/my_value'

    other_service = config["clan"]["core"]["facts"]["services"]["other_service"]
    other_service["secret"]["other_value"] = {}
    other_service["generator"]["script"] = 'echo -n hello > "$secrets"/other_value'
    other_generator = config["clan"]["core"]["vars"]["generators"]["other_generator"]
    # the var to migrate to is mistakenly marked as not secret (migration should fail)
    other_generator["files"]["other_value"]["secret"] = False
    other_generator["migrateFact"] = "my_service"
    other_generator["script"] = 'echo -n value-from-vars > "$out"/other_value'

    flake.refresh()
    monkeypatch.chdir(flake.path)
    cli.run(["facts", "generate", "--flake", str(flake.path), "my_machine"])
    with caplog.at_level(logging.INFO):
        cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])

    assert "Migrated var my_generator/my_value" in caplog.text
    assert "Migrated secret var my_generator/my_secret" in caplog.text
    flake_obj = Flake(str(flake.path))
    my_generator = Generator("my_generator", machine="my_machine", _flake=flake_obj)
    other_generator = Generator(
        "other_generator", machine="my_machine", _flake=flake_obj
    )
    in_repo_store = in_repo.FactStore(flake=flake_obj)
    sops_store = sops.SecretStore(flake=flake_obj)
    assert in_repo_store.exists(my_generator, "my_value")
    assert in_repo_store.get(my_generator, "my_value").decode() == "hello"
    assert sops_store.exists(my_generator, "my_secret")
    assert sops_store.get(my_generator, "my_secret").decode() == "hello"

    assert in_repo_store.exists(other_generator, "other_value")
    assert (
        in_repo_store.get(other_generator, "other_value").decode() == "value-from-vars"
    )


@pytest.mark.with_core
def test_fails_when_files_are_left_from_other_backend(
    monkeypatch: pytest.MonkeyPatch,
    flake_with_sops: ClanFlake,
) -> None:
    flake = flake_with_sops

    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_secret_generator = config["clan"]["core"]["vars"]["generators"][
        "my_secret_generator"
    ]
    my_secret_generator["files"]["my_secret"]["secret"] = True
    my_secret_generator["script"] = 'echo hello > "$out"/my_secret'
    my_value_generator = config["clan"]["core"]["vars"]["generators"][
        "my_value_generator"
    ]
    my_value_generator["files"]["my_value"]["secret"] = False
    my_value_generator["script"] = 'echo hello > "$out"/my_value'
    flake.refresh()
    monkeypatch.chdir(flake.path)
    for generator in ["my_secret_generator", "my_value_generator"]:
        create_machine_vars_interactive(
            Machine(name="my_machine", flake=Flake(str(flake.path))),
            generator,
            regenerate=False,
        )
    # Will raise. It was secret before, but now it's not.
    my_secret_generator["files"]["my_secret"]["secret"] = (
        False  # secret -> public (NOT OK)
    )
    # WIll not raise. It was not secret before, and it's secret now.
    my_value_generator["files"]["my_value"]["secret"] = True  # public -> secret (OK)
    flake.refresh()
    monkeypatch.chdir(flake.path)
    for generator in ["my_secret_generator", "my_value_generator"]:
        # This should raise an error
        if generator == "my_secret_generator":
            with pytest.raises(ClanError):
                create_machine_vars_interactive(
                    Machine(name="my_machine", flake=Flake(str(flake.path))),
                    generator,
                    regenerate=False,
                )
        else:
            create_machine_vars_interactive(
                Machine(name="my_machine", flake=Flake(str(flake.path))),
                generator,
                regenerate=False,
            )


@pytest.mark.with_core
def test_create_sops_age_secrets(
    monkeypatch: pytest.MonkeyPatch, flake: ClanFlake
) -> None:
    monkeypatch.chdir(flake.path)
    cli.run(["vars", "keygen", "--flake", str(flake.path), "--user", "user"])
    # check public key exists
    assert (flake.path / "sops" / "users" / "user").is_dir()
    # check private key exists
    assert (flake.temporary_home / ".config" / "sops" / "age" / "keys.txt").is_file()
    # it should still work, even if the keys already exist
    import shutil

    shutil.rmtree(flake.path / "sops" / "users" / "user")
    cli.run(["vars", "keygen", "--flake", str(flake.path), "--user", "user"])
    # check public key exists
    assert (flake.path / "sops" / "users" / "user").is_dir()


@pytest.mark.with_core
def test_invalidation(
    monkeypatch: pytest.MonkeyPatch,
    flake: ClanFlake,
) -> None:
    config = flake.machines["my_machine"]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"
    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["my_value"]["secret"] = False
    my_generator["script"] = 'echo -n "$RANDOM" > "$out"/my_value'
    flake.refresh()
    monkeypatch.chdir(flake.path)
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    machine = Machine(name="my_machine", flake=Flake(str(flake.path)))
    value1 = get_machine_var(
        str(machine.flake.path), machine.name, "my_generator/my_value"
    ).printable_value
    # generate again and make sure nothing changes without the invalidation data being set
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    value1_new = get_machine_var(
        str(machine.flake.path), machine.name, "my_generator/my_value"
    ).printable_value
    assert value1 == value1_new
    # set the invalidation data of the generator
    my_generator["validation"] = 1
    flake.refresh()
    # generate again and make sure the value changes
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    value2 = get_machine_var(
        str(machine.flake.path), machine.name, "my_generator/my_value"
    ).printable_value
    assert value1 != value2
    # generate again without changing invalidation data -> value should not change
    cli.run(["vars", "generate", "--flake", str(flake.path), "my_machine"])
    value2_new = get_machine_var(
        str(machine.flake.path), machine.name, "my_generator/my_value"
    ).printable_value
    assert value2 == value2_new


@pytest.mark.with_core
def test_dynamic_invalidation(
    monkeypatch: pytest.MonkeyPatch,
    flake: ClanFlake,
) -> None:
    gen_prefix = "config.clan.core.vars.generators"

    clan_flake = Flake(str(flake.path))
    machine = Machine(name="my_machine", flake=clan_flake)

    config = flake.machines[machine.name]
    config["nixpkgs"]["hostPlatform"] = "x86_64-linux"

    my_generator = config["clan"]["core"]["vars"]["generators"]["my_generator"]
    my_generator["files"]["my_value"]["secret"] = False
    my_generator["script"] = 'echo -n "$RANDOM" > "$out"/my_value'

    dependent_generator = config["clan"]["core"]["vars"]["generators"][
        "dependent_generator"
    ]
    dependent_generator["files"]["my_value"]["secret"] = False
    dependent_generator["dependencies"] = ["my_generator"]
    dependent_generator["script"] = 'echo -n "$RANDOM" > "$out"/my_value'

    flake.refresh()

    # this is an abuse
    custom_nix = flake.path / "machines" / machine.name / "hardware-configuration.nix"
    # Set the validation such that we have a ValidationHash
    # The validationHash changes every time, if the my_generator.files.my_value.value changes
    # So every time we re-generate, the dependent_generator should also re-generate.
    # This however is the case anyways. So i dont understand why we have validationHash here.
    custom_nix.write_text(
        """
        { config, ... }: let
            p = config.clan.core.vars.generators.my_generator.files.my_value.flakePath;
        in {
            clan.core.vars.generators.dependent_generator.validation = if builtins.pathExists p then builtins.readFile p else null;
        }
    """
    )

    flake.refresh()
    clan_flake.invalidate_cache()
    monkeypatch.chdir(flake.path)

    # before generating, dependent generator validation should be empty; see bogus hardware-configuration.nix above
    # we have to avoid `*.files.value` in this initial select because the generators haven't been run yet
    # Generators 0: The initial generators before any 'vars generate'
    generators_0 = machine.select(f"{gen_prefix}.*.{{validationHash}}")
    assert generators_0["dependent_generator"]["validationHash"] is None

    # generate both my_generator and (the dependent) dependent_generator
    cli.run(["vars", "generate", "--flake", str(flake.path), machine.name])
    clan_flake.invalidate_cache()

    # after generating once, dependent generator validation should be set
    # Generators_1: The generators after the first 'vars generate'
    generators_1 = machine.select(gen_prefix)
    assert generators_1["dependent_generator"]["validationHash"] is not None

    # @tangential: after generating once, neither generator should want to run again because `clan vars generate` should have re-evaluated the dependent generator's validationHash after executing the parent generator but before executing the dependent generator
    # this ensures that validation can depend on parent generators while still only requiring a single pass
    #
    # @hsjobeki: The above sentence is incorrect we don't re-evaluate in between generator runs.
    # Otherwise we would need to evaluate all machines N-times. Resulting in M*N evaluations each beeing very expensive.
    # Machine evaluation is highly expensive .
    # The generator will thus run again, and produce a different result in the second run.
    cli.run(["vars", "generate", "--flake", str(flake.path), machine.name])
    clan_flake.invalidate_cache()
    # Generators_2: The generators after the second 'vars generate'
    generators_2 = machine.select(gen_prefix)
    assert (
        generators_1["dependent_generator"]["validationHash"]
        == generators_2["dependent_generator"]["validationHash"]
    )
    assert (
        generators_1["my_generator"]["files"]["my_value"]["value"]
        == generators_2["my_generator"]["files"]["my_value"]["value"]
    )
    # The generator value will change on the second run. Because the validationHash changes after the generation.
    # Previously: it changed during generation because we would re-evaluate the flake N-times after each generator was settled.
    # Due to performance reasons, we cannot do this anymore
    assert (
        generators_1["dependent_generator"]["files"]["my_value"]["value"]
        != generators_2["dependent_generator"]["files"]["my_value"]["value"]
    )
