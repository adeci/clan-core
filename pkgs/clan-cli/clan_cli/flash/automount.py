import logging
import shutil
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

from clan_lib.cmd import Log, RunOpts, run
from clan_lib.errors import ClanError
from clan_lib.machines.machines import Machine

log = logging.getLogger(__name__)


@contextmanager
def pause_automounting(
    devices: list[Path], machine: Machine, request_graphical: bool = False
) -> Generator[None]:
    """
    Pause automounting on the device for the duration of this context
    manager
    """

    if shutil.which("udevadm") is None:
        msg = "udev is required to disable automounting"
        log.warning(msg)
        yield None
        return

    inhibit_path = Path(__file__).parent / "inhibit.sh"
    if not inhibit_path.exists():
        msg = f"{inhibit_path} not found"
        raise ClanError(msg)

    str_devs = [str(dev) for dev in devices]
    cmd = [str(inhibit_path), "enable", *str_devs]

    result = run(
        cmd,
        RunOpts(
            log=Log.BOTH,
            check=False,
            needs_user_terminal=True,
            prefix=machine.name,
            requires_root_perm=True,
            graphical_perm=request_graphical,
        ),
    )
    if result.returncode != 0:
        machine.error("Failed to inhibit automounting")
    yield None
    cmd = [str(inhibit_path), "disable", *str_devs]
    result = run(
        cmd,
        RunOpts(
            log=Log.BOTH,
            check=False,
            prefix=machine.name,
            requires_root_perm=True,
            graphical_perm=request_graphical,
        ),
    )
    if result.returncode != 0:
        machine.error("Failed to re-enable automounting")
