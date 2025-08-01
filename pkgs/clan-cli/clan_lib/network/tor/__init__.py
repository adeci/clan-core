import logging
import time
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from typing import TYPE_CHECKING

from clan_lib.errors import ClanError
from clan_lib.network import Network, NetworkTechnologyBase, Peer
from clan_lib.network.tor.lib import is_tor_running, spawn_tor

if TYPE_CHECKING:
    from clan_lib.ssh.remote import Remote


log = logging.getLogger(__name__)


@dataclass(frozen=True)
class NetworkTechnology(NetworkTechnologyBase):
    @property
    def proxy(self) -> int:
        """Return the SOCKS5 proxy port for this network technology."""
        return 9050

    def is_running(self) -> bool:
        """Check if Tor is running by sending HTTP request to SOCKS port."""
        return is_tor_running(self.proxy)

    def ping(self, peer: Peer) -> None | float:
        if self.is_running():
            try:
                remote = self.remote(peer)

                # Use the existing SSH reachability check
                now = time.time()
                remote.check_machine_ssh_reachable()

                return (time.time() - now) * 1000

            except ClanError as e:
                log.debug(f"Error checking peer {peer.host}: {e}")
                return None
        return None

    @contextmanager
    def connection(self, network: Network) -> Iterator[Network]:
        if self.is_running():
            yield network
        else:
            with spawn_tor() as _:
                yield network

    def remote(self, peer: Peer) -> "Remote":
        from clan_lib.ssh.remote import Remote

        return Remote(
            address=peer.host,
            command_prefix=peer.name,
            socks_port=self.proxy,
            socks_wrapper=["torify"],
        )
