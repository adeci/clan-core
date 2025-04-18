import io
import logging
import os
import tarfile
from collections.abc import Iterable
from itertools import chain
from pathlib import Path
from tempfile import TemporaryDirectory

from clan_cli.cmd import CmdOut, Log, RunOpts, run
from clan_cli.machines.machines import Machine
from clan_cli.nix import nix_shell_legacy
from clan_cli.ssh.upload import upload
from clan_cli.vars._types import StoreBase
from clan_cli.vars.generate import Generator, Var

log = logging.getLogger(__name__)


class SecretStore(StoreBase):
    @property
    def is_secret_store(self) -> bool:
        return True

    def __init__(self, machine: Machine) -> None:
        self.machine = machine
        self.entry_prefix = "clan-vars"

    @property
    def store_name(self) -> str:
        return "password_store"

    @property
    def _store_backend(self) -> str:
        backend = self.machine.eval_nix("config.clan.core.vars.settings.passBackend")
        return backend

    @property
    def _password_store_dir(self) -> Path:
        if self._store_backend == "passage":
            lookup = os.environ.get("PASSAGE_DIR")
            default = Path.home() / ".passage/store"
        else:
            lookup = os.environ.get("PASSWORD_STORE_DIR")
            default = Path.home() / ".password-store"
        return Path(lookup) if lookup else default

    def entry_dir(self, generator: Generator, name: str) -> Path:
        return Path(self.entry_prefix) / self.rel_dir(generator, name)

    def _run_pass(self, *args: str, options: RunOpts | None = None) -> CmdOut:
        cmd = nix_shell_legacy(
            packages=["nixpkgs#pass"], cmd=[self._store_backend, *args]
        )
        return run(cmd, options)

    def _set(
        self,
        generator: Generator,
        var: Var,
        value: bytes,
    ) -> Path | None:
        pass_call = ["insert", "-m", str(self.entry_dir(generator, var.name))]
        self._run_pass(*pass_call, options=RunOpts(input=value, check=True))
        return None  # we manage the files outside of the git repo

    def get(self, generator: Generator, name: str) -> bytes:
        pass_name = str(self.entry_dir(generator, name))
        return self._run_pass("show", pass_name).stdout.encode()

    def exists(self, generator: Generator, name: str) -> bool:
        extension = "age" if self._store_backend == "passage" else "gpg"
        filename = f"{self.entry_dir(generator, name)}.{extension}"
        return (self._password_store_dir / filename).exists()

    def delete(self, generator: Generator, name: str) -> Iterable[Path]:
        pass_name = str(self.entry_dir(generator, name))
        self._run_pass("rm", "--force", pass_name, options=RunOpts(check=True))
        return []

    def delete_store(self) -> Iterable[Path]:
        machine_dir = Path(self.entry_prefix) / "per-machine" / self.machine.name
        if not (self._password_store_dir / machine_dir).exists():
            # The directory may not exist if the machine
            # has no vars, or they have been deleted already.
            return []
        pass_call = ["rm", "--force", "--recursive", str(machine_dir)]
        self._run_pass(*pass_call, options=RunOpts(check=True))
        return []

    def generate_hash(self) -> bytes:
        hashes = []
        hashes.append(
            run(
                nix_shell_legacy(
                    ["nixpkgs#git"],
                    [
                        "git",
                        "-C",
                        str(self._password_store_dir),
                        "log",
                        "-1",
                        "--format=%H",
                        self.entry_prefix,
                    ],
                ),
                RunOpts(check=False),
            )
            .stdout.strip()
            .encode()
        )
        shared_dir = self._password_store_dir / self.entry_prefix / "shared"
        machine_dir = (
            self._password_store_dir
            / self.entry_prefix
            / "per-machine"
            / self.machine.name
        )
        for symlink in chain(shared_dir.glob("**/*"), machine_dir.glob("**/*")):
            if symlink.is_symlink():
                hashes.append(
                    run(
                        nix_shell_legacy(
                            ["nixpkgs#git"],
                            [
                                "git",
                                "-C",
                                str(self._password_store_dir),
                                "log",
                                "-1",
                                "--format=%H",
                                str(symlink),
                            ],
                        ),
                        RunOpts(check=False),
                    )
                    .stdout.strip()
                    .encode()
                )

        # we sort the hashes to make sure that the order is always the same
        hashes.sort()

        manifest = []
        for generator in self.machine.vars_generators:
            for file in generator.files:
                manifest.append(f"{generator.name}/{file.name}".encode())
        manifest += hashes
        return b"\n".join(manifest)

    def needs_upload(self) -> bool:
        local_hash = self.generate_hash()
        remote_hash = self.machine.target_host.run(
            # TODO get the path to the secrets from the machine
            [
                "cat",
                f"{self.machine.deployment['password-store']['secretLocation']}/.{self._store_backend}_info",
            ],
            RunOpts(log=Log.STDERR, check=False),
        ).stdout.strip()

        if not remote_hash:
            print("remote hash is empty")
            return True

        return local_hash.decode() != remote_hash

    def populate_dir(self, output_dir: Path, phases: list[str]) -> None:
        if "users" in phases:
            with tarfile.open(
                output_dir / "secrets_for_users.tar.gz", "w:gz"
            ) as user_tar:
                for generator in self.machine.vars_generators:
                    dir_exists = False
                    for file in generator.files:
                        if not file.deploy:
                            continue
                        if not file.secret:
                            continue
                        tar_file = tarfile.TarInfo(name=f"{generator.name}/{file.name}")
                        content = self.get(generator, file.name)
                        tar_file.size = len(content)
                        tar_file.mode = file.mode
                        user_tar.addfile(tarinfo=tar_file, fileobj=io.BytesIO(content))

        if "services" in phases:
            with tarfile.open(output_dir / "secrets.tar.gz", "w:gz") as tar:
                for generator in self.machine.vars_generators:
                    dir_exists = False
                    for file in generator.files:
                        if not file.deploy:
                            continue
                        if not file.secret:
                            continue
                        if not dir_exists:
                            tar_dir = tarfile.TarInfo(name=generator.name)
                            tar_dir.type = tarfile.DIRTYPE
                            tar_dir.mode = 0o511
                            tar.addfile(tarinfo=tar_dir)
                            dir_exists = True
                        tar_file = tarfile.TarInfo(name=f"{generator.name}/{file.name}")
                        content = self.get(generator, file.name)
                        tar_file.size = len(content)
                        tar_file.mode = file.mode
                        tar_file.uname = file.owner
                        tar_file.gname = file.group
                        tar.addfile(tarinfo=tar_file, fileobj=io.BytesIO(content))
        if "activation" in phases:
            for generator in self.machine.vars_generators:
                for file in generator.files:
                    if file.needed_for == "activation":
                        out_file = (
                            output_dir / "activation" / generator.name / file.name
                        )
                        out_file.parent.mkdir(parents=True, exist_ok=True)
                        out_file.write_bytes(self.get(generator, file.name))
        if "partitioning" in phases:
            for generator in self.machine.vars_generators:
                for file in generator.files:
                    if file.needed_for == "partitioning":
                        out_file = (
                            output_dir / "partitioning" / generator.name / file.name
                        )
                        out_file.parent.mkdir(parents=True, exist_ok=True)
                        out_file.write_bytes(self.get(generator, file.name))

        (output_dir / f".{self._store_backend}_info").write_bytes(self.generate_hash())

    def upload(self, phases: list[str]) -> None:
        if "partitioning" in phases:
            msg = "Cannot upload partitioning secrets"
            raise NotImplementedError(msg)
        if not self.needs_upload():
            log.info("Secrets already uploaded")
            return
        with TemporaryDirectory(prefix="vars-upload-") as _tempdir:
            pass_dir = Path(_tempdir).resolve()
            self.populate_dir(pass_dir, phases)
            upload_dir = Path(
                self.machine.deployment["password-store"]["secretLocation"]
            )
            upload(self.machine.target_host, pass_dir, upload_dir)
