import importlib
import json
import logging
import re
from dataclasses import dataclass, field
from functools import cached_property
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

from clan_cli.errors import ClanCmdError, ClanError
from clan_cli.facts import public_modules as facts_public_modules
from clan_cli.facts import secret_modules as facts_secret_modules
from clan_cli.flake import Flake
from clan_cli.nix import nix_config, nix_test_store
from clan_cli.ssh.host import Host
from clan_cli.ssh.host_key import HostKeyCheck
from clan_cli.ssh.parse import parse_deployment_address
from clan_cli.vars._types import StoreBase

log = logging.getLogger(__name__)

if TYPE_CHECKING:
    from clan_cli.vars.generate import Generator


@dataclass
class Machine:
    name: str
    flake: Flake
    nix_options: list[str] = field(default_factory=list)
    cached_deployment: None | dict[str, Any] = None
    override_target_host: None | str = None
    override_build_host: None | str = None
    host_key_check: HostKeyCheck = HostKeyCheck.STRICT

    def get_id(self) -> str:
        return f"{self.flake}#{self.name}"

    def flush_caches(self) -> None:
        self.flake.prefetch()

    def __str__(self) -> str:
        return f"Machine(name={self.name}, flake={self.flake})"

    def __repr__(self) -> str:
        return str(self)

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        kwargs.update({"extra": {"command_prefix": self.name}})
        log.debug(msg, *args, **kwargs)

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        kwargs.update({"extra": {"command_prefix": self.name}})
        log.info(msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        kwargs.update({"extra": {"command_prefix": self.name}})
        log.error(msg, *args, **kwargs)

    @property
    # `class` is a keyword, `_class` triggers `SLF001` so we use a sunder name
    def _class_(self) -> str:
        try:
            return self.flake.select(
                f"clanInternals.inventory.machineClass.{self.name}"
            )
        except ClanCmdError as e:
            if re.search(f"error: attribute '{self.name}' missing", e.cmd.stderr):
                return "nixos"
            raise

    @property
    def system(self) -> str:
        return self.flake.select(
            f"{self._class_}Configurations.{self.name}.pkgs.hostPlatform.system"
        )

    @property
    def deployment(self) -> dict:
        deployment = json.loads(
            self.build_nix("config.system.clan.deployment.file").read_text()
        )
        return deployment

    @property
    def target_host_address(self) -> str:
        val = self.override_target_host or self.deployment.get("targetHost")
        if val is None:
            msg = f"'targetHost' is not set for machine '{self.name}'"
            raise ClanError(
                msg,
                description="See https://docs.clan.lol/getting-started/deploy/#setting-the-target-host for more information.",
            )
        return val

    @property
    def secret_facts_module(
        self,
    ) -> Literal[
        "clan_cli.facts.secret_modules.sops",
        "clan_cli.facts.secret_modules.vm",
        "clan_cli.facts.secret_modules.password_store",
    ]:
        return self.deployment["facts"]["secretModule"]

    @property
    def public_facts_module(
        self,
    ) -> Literal[
        "clan_cli.facts.public_modules.in_repo", "clan_cli.facts.public_modules.vm"
    ]:
        return self.deployment["facts"]["publicModule"]

    @cached_property
    def secret_facts_store(self) -> facts_secret_modules.SecretStoreBase:
        module = importlib.import_module(self.secret_facts_module)
        return module.SecretStore(machine=self)

    @cached_property
    def public_facts_store(self) -> facts_public_modules.FactStoreBase:
        module = importlib.import_module(self.public_facts_module)
        return module.FactStore(machine=self)

    @property
    def secret_vars_module(self) -> str:
        return self.deployment["vars"]["secretModule"]

    @property
    def public_vars_module(self) -> str:
        return self.deployment["vars"]["publicModule"]

    @cached_property
    def secret_vars_store(self) -> StoreBase:
        module = importlib.import_module(self.secret_vars_module)
        return module.SecretStore(machine=self)

    @cached_property
    def public_vars_store(self) -> StoreBase:
        module = importlib.import_module(self.public_vars_module)
        return module.FactStore(machine=self)

    @property
    def facts_data(self) -> dict[str, dict[str, Any]]:
        if self.deployment["facts"]["services"]:
            return self.deployment["facts"]["services"]
        return {}

    @property
    def vars_generators(self) -> list["Generator"]:
        from clan_cli.vars.generate import Generator

        clan_vars = self.deployment.get("vars")
        if clan_vars is None:
            return []
        generators: dict[str, Any] = clan_vars.get("generators")
        if generators is None:
            return []
        _generators = [Generator.from_json(gen) for gen in generators.values()]
        for gen in _generators:
            gen.machine(self)

        return _generators

    @property
    def secrets_upload_directory(self) -> str:
        return self.deployment["facts"]["secretUploadDirectory"]

    @property
    def flake_dir(self) -> Path:
        return self.flake.path

    @property
    def target_host(self) -> Host:
        return parse_deployment_address(
            self.name,
            self.target_host_address,
            self.host_key_check,
            meta={"machine": self},
        )

    @property
    def build_host(self) -> Host:
        """
        The host where the machine is built and deployed from.
        Can be the same as the target host.
        """
        build_host = self.override_build_host or self.deployment.get("buildHost")
        if build_host is None:
            return self.target_host
        # enable ssh agent forwarding to allow the build host to access the target host
        return parse_deployment_address(
            self.name,
            build_host,
            self.host_key_check,
            forward_agent=True,
            meta={"machine": self, "target_host": self.target_host},
        )

    def nix(
        self,
        method: Literal["eval", "build"],
        attr: str,
        nix_options: list[str] | None = None,
    ) -> Any:
        """
        Build the machine and return the path to the result
        accepts a secret store and a facts store # TODO
        """
        if nix_options is None:
            nix_options = []

        config = nix_config()
        system = config["system"]

        return self.flake.select(
            f'clanInternals.machines."{system}".{self.name}.{attr}',
            nix_options=nix_options,
        )

    def eval_nix(
        self,
        attr: str,
        refresh: bool = False,
        extra_config: None | dict = None,
        nix_options: list[str] | None = None,
    ) -> Any:
        """
        eval a nix attribute of the machine
        @attr: the attribute to get
        """

        if extra_config:
            log.warning("extra_config in eval_nix is no longer supported")

        if nix_options is None:
            nix_options = []

        return self.nix("eval", attr, nix_options)

    def build_nix(
        self,
        attr: str,
        extra_config: None | dict = None,
        nix_options: list[str] | None = None,
    ) -> Path:
        """
        build a nix attribute of the machine
        @attr: the attribute to get
        """

        if extra_config:
            log.warning("extra_config in build_nix is no longer supported")

        if nix_options is None:
            nix_options = []

        output = self.nix("build", attr, nix_options)
        output = Path(output)
        if tmp_store := nix_test_store():
            output = tmp_store.joinpath(*output.parts[1:])
        assert output.exists(), f"The output {output} doesn't exist"
        if isinstance(output, Path):
            return output
        msg = "build_nix returned not a Path"
        raise ClanError(msg)
