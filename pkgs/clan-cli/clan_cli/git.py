from pathlib import Path

# from clan_cli.dirs import find_git_repo_root
from clan_cli.errors import ClanError
from clan_cli.nix import nix_shell

from .cmd import Log, run


def commit_file(
    file_path: Path,
    repo_dir: Path,
    commit_message: str | None = None,
) -> None:
    """Commit a file to a git repository.

    :param file_path: The path to the file to commit.
    :param repo_dir: The path to the git repository.
    :param commit_message: The commit message.
    :raises ClanError: If the file is not in the git repository.
    """
    commit_files([file_path], repo_dir, commit_message)


# generic vcs agnostic commit function
def commit_files(
    file_paths: list[Path],
    repo_dir: Path,
    commit_message: str | None = None,
) -> None:
    # check that the file is in the git repository and exists
    for file_path in file_paths:
        if not Path(file_path).resolve().is_relative_to(repo_dir.resolve()):
            raise ClanError(f"File {file_path} is not in the git repository {repo_dir}")
        if not file_path.exists():
            raise ClanError(f"File {file_path} does not exist")
    # generate commit message if not provided
    if commit_message is None:
        commit_message = ""
        for file_path in file_paths:
            # ensure that mentioned file path is relative to repo
            commit_message += f"Add {file_path.relative_to(repo_dir)}"
    # check if the repo is a git repo and commit
    if (repo_dir / ".git").exists():
        _commit_file_to_git(repo_dir, file_paths, commit_message)
    else:
        return


def _commit_file_to_git(
    repo_dir: Path, file_paths: list[Path], commit_message: str
) -> None:
    """Commit a file to a git repository.

    :param repo_dir: The path to the git repository.
    :param file_path: The path to the file to commit.
    :param commit_message: The commit message.
    :raises ClanError: If the file is not in the git repository.
    """
    for file_path in file_paths:
        cmd = nix_shell(
            ["nixpkgs#git"],
            ["git", "-C", str(repo_dir), "add", str(file_path)],
        )
        # add the file to the git index

        run(cmd, log=Log.BOTH, error_msg=f"Failed to add {file_path} file to git index")

    # check if there is a diff
    cmd = nix_shell(
        ["nixpkgs#git"],
        ["git", "-C", str(repo_dir), "diff", "--cached", "--exit-code"]
        + [str(file_path) for file_path in file_paths],
    )
    result = run(cmd, check=False, cwd=repo_dir)
    # if there is no diff, return
    if result.returncode == 0:
        return

    # commit only that file
    cmd = nix_shell(
        ["nixpkgs#git"],
        [
            "git",
            "-C",
            str(repo_dir),
            "commit",
            "-m",
            commit_message,
        ]
        + [str(file_path) for file_path in file_paths],
    )

    run(cmd, error_msg=f"Failed to commit {file_paths} to git repository {repo_dir}")
