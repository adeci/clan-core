import os
import subprocess
from pathlib import Path
from typing import override

from clan_cli.cmd import Log, RunOpts
from clan_cli.machines.machines import Machine
from clan_cli.nix import nix_shell_legacy

from . import SecretStoreBase


class SecretStore(SecretStoreBase):
    def __init__(self, machine: Machine) -> None:
        self.machine = machine

    def set(
        self, service: str, name: str, value: bytes, groups: list[str]
    ) -> Path | None:
        subprocess.run(
            nix_shell_legacy(
                ["nixpkgs#pass"],
                ["pass", "insert", "-m", f"machines/{self.machine.name}/{name}"],
            ),
            input=value,
            check=True,
        )
        return None  # we manage the files outside of the git repo

    def get(self, service: str, name: str) -> bytes:
        return subprocess.run(
            nix_shell_legacy(
                ["nixpkgs#pass"],
                ["pass", "show", f"machines/{self.machine.name}/{name}"],
            ),
            check=True,
            stdout=subprocess.PIPE,
        ).stdout

    def exists(self, service: str, name: str) -> bool:
        password_store = os.environ.get(
            "PASSWORD_STORE_DIR", f"{os.environ['HOME']}/.password-store"
        )
        secret_path = Path(password_store) / f"machines/{self.machine.name}/{name}.gpg"
        return secret_path.exists()

    def generate_hash(self) -> bytes:
        password_store = os.environ.get(
            "PASSWORD_STORE_DIR", f"{os.environ['HOME']}/.password-store"
        )
        hashes = []
        hashes.append(
            subprocess.run(
                nix_shell_legacy(
                    ["nixpkgs#git"],
                    [
                        "git",
                        "-C",
                        password_store,
                        "log",
                        "-1",
                        "--format=%H",
                        f"machines/{self.machine.name}",
                    ],
                ),
                stdout=subprocess.PIPE,
                check=False,
            ).stdout.strip()
        )
        for symlink in Path(password_store).glob(f"machines/{self.machine.name}/**/*"):
            if symlink.is_symlink():
                hashes.append(
                    subprocess.run(
                        nix_shell_legacy(
                            ["nixpkgs#git"],
                            [
                                "git",
                                "-C",
                                password_store,
                                "log",
                                "-1",
                                "--format=%H",
                                str(symlink),
                            ],
                        ),
                        stdout=subprocess.PIPE,
                        check=False,
                    ).stdout.strip()
                )

        # we sort the hashes to make sure that the order is always the same
        hashes.sort()
        return b"\n".join(hashes)

    @override
    def needs_upload(self) -> bool:
        local_hash = self.generate_hash()
        remote_hash = self.machine.target_host.run(
            # TODO get the path to the secrets from the machine
            ["cat", f"{self.machine.secrets_upload_directory}/.pass_info"],
            RunOpts(log=Log.STDERR, check=False),
        ).stdout.strip()

        if not remote_hash:
            print("remote hash is empty")
            return True

        return local_hash.decode() != remote_hash

    def upload(self, output_dir: Path) -> None:
        os.umask(0o077)
        for service in self.machine.facts_data:
            for secret in self.machine.facts_data[service]["secret"]:
                if isinstance(secret, dict):
                    secret_name = secret["name"]
                else:
                    # TODO: drop old format soon
                    secret_name = secret
                (output_dir / secret_name).write_bytes(self.get(service, secret_name))
        (output_dir / ".pass_info").write_bytes(self.generate_hash())
