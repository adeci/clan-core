import json
import logging
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

from clan_cli.clan_uri import ClanURI, MachineData
from clan_cli.dirs import vm_state_dir
from qemu.qmp import QEMUMonitorProtocol

from ..cmd import run
from ..errors import ClanError
from ..nix import nix_build, nix_config, nix_eval, nix_metadata
from ..ssh import Host, parse_deployment_address

log = logging.getLogger(__name__)


class QMPWrapper:
    def __init__(self, state_dir: Path) -> None:
        # These sockets here are just symlinks to the real sockets which
        # are created by the run.py file. The reason being that we run into
        # file path length issues on Linux. If no qemu process is running
        # the symlink will be dangling.
        self._qmp_socket: Path = state_dir / "qmp.sock"
        self._qga_socket: Path = state_dir / "qga.sock"

    @contextmanager
    def qmp_ctx(self) -> Generator[QEMUMonitorProtocol, None, None]:
        rpath = self._qmp_socket.resolve()
        if not rpath.exists():
            raise ClanError(f"qmp socket {rpath} does not exist. Is the VM running?")
        qmp = QEMUMonitorProtocol(str(rpath))
        qmp.connect()
        try:
            yield qmp
        finally:
            qmp.close()


class Machine:
    flake: str | Path
    name: str
    data: MachineData
    eval_cache: dict[str, str]
    build_cache: dict[str, Path]
    _flake_path: Path | None
    _deployment_info: None | dict[str, str]
    vm: QMPWrapper

    def __init__(
        self,
        name: str,
        flake: Path | str,
        deployment_info: dict | None = None,
        machine: MachineData | None = None,
    ) -> None:
        """
        Creates a Machine
        @name: the name of the machine
        @clan_dir: the directory of the clan, optional, if not set it will be determined from the current working directory
        @machine_json: can be optionally used to skip evaluation of the machine, location of the json file with machine data
        """
        if machine is None:
            uri = ClanURI.from_str(str(flake), name)
            machine = uri.machine
            self.flake: str | Path = machine.flake_id._value
            self.name: str = machine.name
            self.data: MachineData = machine
        else:
            self.data: MachineData = machine

        self.eval_cache: dict[str, str] = {}
        self.build_cache: dict[str, Path] = {}
        self._flake_path: Path | None = None
        self._deployment_info: None | dict[str, str] = deployment_info

        state_dir = vm_state_dir(flake_url=str(self.flake), vm_name=self.data.name)

        self.vm: QMPWrapper = QMPWrapper(state_dir)

    def __str__(self) -> str:
        return f"Machine(name={self.data.name}, flake={self.data.flake_id})"

    def __repr__(self) -> str:
        return str(self)

    @property
    def deployment_info(self) -> dict[str, str]:
        if self._deployment_info is not None:
            return self._deployment_info
        self._deployment_info = json.loads(
            self.build_nix("config.system.clan.deployment.file").read_text()
        )
        return self._deployment_info

    @property
    def target_host_address(self) -> str:
        # deploymentAddress is deprecated.
        val = self.deployment_info.get("targetHost") or self.deployment_info.get(
            "deploymentAddress"
        )
        if val is None:
            msg = f"the 'clan.networking.targetHost' nixos option is not set for machine '{self.data.name}'"
            raise ClanError(msg)
        return val

    @target_host_address.setter
    def target_host_address(self, value: str) -> None:
        self.deployment_info["targetHost"] = value

    @property
    def secrets_module(self) -> str:
        return self.deployment_info["secretsModule"]

    @property
    def facts_module(self) -> str:
        return self.deployment_info["factsModule"]

    @property
    def secrets_data(self) -> dict[str, dict[str, Any]]:
        if self.deployment_info["secretsData"]:
            try:
                return json.loads(Path(self.deployment_info["secretsData"]).read_text())
            except json.JSONDecodeError as e:
                raise ClanError(
                    f"Failed to parse secretsData for machine {self.data.name} as json"
                ) from e
        return {}

    @property
    def secrets_upload_directory(self) -> str:
        return self.deployment_info["secretsUploadDirectory"]

    @property
    def flake_dir(self) -> Path:
        if self._flake_path:
            return self._flake_path

        if self.data.flake_id.is_local():
            self._flake_path = self.data.flake_id.path
        elif self.data.flake_id.is_remote():
            self._flake_path = Path(nix_metadata(self.data.flake_id.url)["path"])
        else:
            raise ClanError(f"Unsupported flake url: {self.data.flake_id}")

        assert self._flake_path is not None
        return self._flake_path

    @property
    def target_host(self) -> Host:
        return parse_deployment_address(
            self.data.name, self.target_host_address, meta={"machine": self}
        )

    @property
    def build_host(self) -> Host:
        """
        The host where the machine is built and deployed from.
        Can be the same as the target host.
        """
        build_host = self.deployment_info.get("buildHost")
        if build_host is None:
            return self.target_host
        # enable ssh agent forwarding to allow the build host to access the target host
        return parse_deployment_address(
            self.data.name,
            build_host,
            forward_agent=True,
            meta={"machine": self, "target_host": self.target_host},
        )

    def nix(
        self,
        method: str,
        attr: str,
        extra_config: None | dict = None,
        impure: bool = False,
        nix_options: list[str] = [],
    ) -> str | Path:
        """
        Build the machine and return the path to the result
        accepts a secret store and a facts store # TODO
        """
        config = nix_config()
        system = config["system"]

        file_info = dict()
        with NamedTemporaryFile(mode="w") as config_json:
            if extra_config is not None:
                json.dump(extra_config, config_json, indent=2)
            else:
                json.dump({}, config_json)
            config_json.flush()

            file_info = json.loads(
                run(
                    nix_eval(
                        [
                            "--impure",
                            "--expr",
                            f'let x = (builtins.fetchTree {{ type = "file"; url = "file://{config_json.name}"; }}); in {{ narHash = x.narHash; path = x.outPath; }}',
                        ]
                    )
                ).stdout.strip()
            )

        args = []

        # get git commit from flake
        if extra_config is not None:
            metadata = nix_metadata(self.flake_dir)
            url = metadata["url"]
            if "dirtyRevision" in metadata:
                # if not impure:
                #     raise ClanError(
                #         "The machine has a dirty revision, and impure mode is not allowed"
                #     )
                # else:
                #     args += ["--impure"]
                args += ["--impure"]

            args += [
                "--expr",
                f"""
                    ((builtins.getFlake "{url}").clanInternals.machinesFunc."{system}"."{self.data.name}" {{
                      extraConfig = builtins.fromJSON (builtins.readFile (builtins.fetchTree {{
                        type = "file";
                        url = if (builtins.compareVersions builtins.nixVersion "2.19") == -1 then "{file_info["path"]}" else "file:{file_info["path"]}";
                        narHash = "{file_info["narHash"]}";
                      }}));
                    }}).{attr}
                """,
            ]
        else:
            if (self.flake_dir / ".git").exists():
                flake = f"git+file://{self.flake_dir}"
            else:
                flake = f"path:{self.flake_dir}"

            args += [
                f'{flake}#clanInternals.machines."{system}".{self.data.name}.{attr}',
                *nix_options,
            ]

        if method == "eval":
            output = run(nix_eval(args)).stdout.strip()
            return output
        elif method == "build":
            outpath = run(nix_build(args)).stdout.strip()
            return Path(outpath)
        else:
            raise ValueError(f"Unknown method {method}")

    def eval_nix(
        self,
        attr: str,
        refresh: bool = False,
        extra_config: None | dict = None,
        impure: bool = False,
        nix_options: list[str] = [],
    ) -> str:
        """
        eval a nix attribute of the machine
        @attr: the attribute to get
        """
        if attr in self.eval_cache and not refresh and extra_config is None:
            return self.eval_cache[attr]

        output = self.nix("eval", attr, extra_config, impure, nix_options)
        if isinstance(output, str):
            self.eval_cache[attr] = output
            return output
        else:
            raise ClanError("eval_nix returned not a string")

    def build_nix(
        self,
        attr: str,
        refresh: bool = False,
        extra_config: None | dict = None,
        impure: bool = False,
        nix_options: list[str] = [],
    ) -> Path:
        """
        build a nix attribute of the machine
        @attr: the attribute to get
        """

        if attr in self.build_cache and not refresh and extra_config is None:
            return self.build_cache[attr]

        output = self.nix("build", attr, extra_config, impure, nix_options)
        if isinstance(output, Path):
            self.build_cache[attr] = output
            return output
        else:
            raise ClanError("build_nix returned not a Path")
