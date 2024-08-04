import os
import sys
import threading
import traceback
from pathlib import Path
from time import sleep

from clan_cli.dirs import vm_state_dir
from clan_cli.qemu.qga import QgaSession
from clan_cli.qemu.qmp import QEMUMonitorProtocol

from . import cli


def run_vm_in_thread(machine_name: str) -> None:
    # runs machine and prints exceptions
    def run() -> None:
        try:
            cli.run(["vms", "run", machine_name])
        except Exception:
            # print exception details
            print(traceback.format_exc(), file=sys.stderr)
            print(sys.exc_info()[2], file=sys.stderr)

    # run the machine in a separate thread
    t = threading.Thread(target=run, name="run")
    t.daemon = True
    t.start()
    return


# wait for qmp socket to exist
def wait_vm_up(machine_name: str, flake_url: str | None = None) -> None:
    if flake_url is None:
        flake_url = str(Path.cwd())
    socket_file = vm_state_dir(flake_url, machine_name) / "qmp.sock"
    timeout: float = 100
    while True:
        if timeout <= 0:
            raise TimeoutError(
                f"qmp socket {socket_file} not found. Is the VM running?"
            )
        if socket_file.exists():
            break
        sleep(0.1)
        timeout -= 0.1


# wait for vm to be down by checking if qmp socket is down
def wait_vm_down(machine_name: str, flake_url: str | None = None) -> None:
    if flake_url is None:
        flake_url = str(Path.cwd())
    socket_file = vm_state_dir(flake_url, machine_name) / "qmp.sock"
    timeout: float = 300
    while socket_file.exists():
        if timeout <= 0:
            raise TimeoutError(
                f"qmp socket {socket_file} still exists. Is the VM down?"
            )
        sleep(0.1)
        timeout -= 0.1


# wait for vm to be up then connect and return qmp instance
def qmp_connect(machine_name: str, flake_url: str | None = None) -> QEMUMonitorProtocol:
    if flake_url is None:
        flake_url = str(Path.cwd())
    state_dir = vm_state_dir(flake_url, machine_name)
    wait_vm_up(machine_name, flake_url)
    qmp = QEMUMonitorProtocol(
        address=str(os.path.realpath(state_dir / "qmp.sock")),
    )
    qmp.connect()
    return qmp


# wait for vm to be up then connect and return qga instance
def qga_connect(machine_name: str, flake_url: str | None = None) -> QgaSession:
    if flake_url is None:
        flake_url = str(Path.cwd())
    state_dir = vm_state_dir(flake_url, machine_name)
    wait_vm_up(machine_name, flake_url)
    return QgaSession(os.path.realpath(state_dir / "qga.sock"))
