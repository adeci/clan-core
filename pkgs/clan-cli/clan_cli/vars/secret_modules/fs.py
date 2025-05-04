import shutil
import tempfile
from pathlib import Path

from clan_cli.machines.machines import Machine
from clan_cli.ssh.host import Host
from clan_cli.vars._types import StoreBase
from clan_cli.vars.generate import Generator, Var


class SecretStore(StoreBase):
    @property
    def is_secret_store(self) -> bool:
        return True

    def __init__(self, machine: Machine) -> None:
        self.machine = machine
        self.dir = Path(tempfile.gettempdir()) / "clan_secrets"
        self.dir.mkdir(parents=True, exist_ok=True)

    @property
    def store_name(self) -> str:
        return "fs"

    def _set(
        self,
        generator: Generator,
        var: Var,
        value: bytes,
    ) -> Path | None:
        secret_file = self.dir / generator.name / var.name
        secret_file.parent.mkdir(parents=True, exist_ok=True)
        secret_file.write_bytes(value)
        return None  # we manage the files outside of the git repo

    def exists(self, generator: "Generator", name: str) -> bool:
        return (self.dir / generator.name / name).exists()

    def get(self, generator: Generator, name: str) -> bytes:
        secret_file = self.dir / generator.name / name
        return secret_file.read_bytes()

    def populate_dir(self, output_dir: Path, phases: list[str]) -> None:
        if output_dir.exists():
            shutil.rmtree(output_dir)
        shutil.copytree(self.dir, output_dir)
        shutil.rmtree(self.dir)

    def upload(self, host: Host, phases: list[str]) -> None:
        msg = "Cannot upload secrets with FS backend"
        raise NotImplementedError(msg)
