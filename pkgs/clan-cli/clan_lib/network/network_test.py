from typing import Any
from unittest.mock import MagicMock, patch

from clan_lib.flake import Flake
from clan_lib.network.network import Network, Peer, networks_from_flake


@patch("clan_lib.network.network.get_machine_var")
def test_networks_from_flake(mock_get_machine_var: MagicMock) -> None:
    # Create a mock flake
    flake = MagicMock(spec=Flake)

    # Mock the var decryption
    def mock_var_side_effect(flake_path: str, machine: str, var_path: str) -> Any:
        if machine == "machine1" and var_path == "wireguard/address":
            mock_var = MagicMock()
            mock_var.value.decode.return_value = "192.168.1.10"
            return mock_var
        if machine == "machine2" and var_path == "wireguard/address":
            mock_var = MagicMock()
            mock_var.value.decode.return_value = "192.168.1.11"
            return mock_var
        return None

    mock_get_machine_var.side_effect = mock_var_side_effect

    # Define the expected return value from flake.select
    mock_networking_data = {
        "exports": {
            "vpn-network": {
                "peers": {
                    "machine1": {
                        "name": "machine1",
                        "host": {
                            "var": {
                                "machine": "machine1",
                                "generator": "wireguard",
                                "file": "address",
                            }
                        },
                    },
                    "machine2": {
                        "name": "machine2",
                        "host": {
                            "var": {
                                "machine": "machine2",
                                "generator": "wireguard",
                                "file": "address",
                            }
                        },
                    },
                },
                "module": "clan_lib.network.tor",
                "priority": 1000,
            },
            "local-network": {
                "peers": {
                    "machine1": {
                        "name": "machine1",
                        "host": {"plain": "10.0.0.10"},
                    },
                    "machine3": {
                        "name": "machine3",
                        "host": {"plain": "10.0.0.12"},
                    },
                },
                "module": "clan_lib.network.direct",
                "priority": 500,
            },
        }
    }

    # Mock the select method
    flake.select.return_value = mock_networking_data

    # Call the function
    networks = networks_from_flake(flake)

    # Verify the flake.select was called with the correct pattern
    flake.select.assert_called_once_with("clan.?exports.instances.*.networking")

    # Verify the returned networks
    assert len(networks) == 2
    assert "vpn-network" in networks
    assert "local-network" in networks

    # Check vpn-network
    vpn_network = networks["vpn-network"]
    assert isinstance(vpn_network, Network)
    assert vpn_network.module_name == "clan_lib.network.tor"
    assert vpn_network.priority == 1000
    assert len(vpn_network.peers) == 2
    assert "machine1" in vpn_network.peers
    assert "machine2" in vpn_network.peers

    # Check peer details - this will call get_machine_var to decrypt the var
    machine1_peer = vpn_network.peers["machine1"]
    assert isinstance(machine1_peer, Peer)
    assert machine1_peer.host == "192.168.1.10"
    assert machine1_peer.flake == flake

    # Check local-network
    local_network = networks["local-network"]
    assert local_network.module_name == "clan_lib.network.direct"
    assert local_network.priority == 500
    assert len(local_network.peers) == 2
    assert "machine1" in local_network.peers
    assert "machine3" in local_network.peers
