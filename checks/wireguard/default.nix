{
  pkgs,
  self,
  clanLib,
  ...
}:
clanLib.test.makeTestClan {
  inherit pkgs self;
  nixosTest = (
    { lib, ... }:

    let
      machines = [
        "controller1"
        "controller2"
        "peer1"
        "peer2"
      ];
    in
    {
      name = "wireguard";

      clan = {
        directory = ./.;
        inventory = {
          modules."@clan/wireguard" = import ../../clanServices/wireguard/default.nix;

          machines = lib.genAttrs machines (_: { });

          instances = {

            #      wg-test-two
            #    ┌──────────────┐
            #    │              │                               │ wg-test-one │ wg-test-two │ endpoint
            #    │              ▼                  ─────────────┼─────────────┼─────────────┼────────────
            #    │   ┌──────► peer1 ◄───────┐       controller1 │ 192.168.8.1 │ 192.168.9.1 │ 192.168.1.1
            #    │   │                      │       controller2 │ 192.168.8.2 │     ---     │ 192.168.1.2
            #    ▼   ▼                      ▼       peer1       │ 192.168.8.3 │ 192.168.9.3 │     ---
            # controller1 ◄──────────► controller2  peer2       │ 182.168.8.4 │     ---     │     ---
            #        ▲                      ▲
            #        │                      │
            #        └──────► peer2 ◄───────┘

            wg-test-one = {

              module.name = "@clan/wireguard";

              roles.controller.machines."controller1".settings = {
                # ip = "192.168.8.1";
                endpoint = "192.168.1.1";
                port = 51920;
              };

              roles.controller.machines."controller2".settings = {
                # ip = "192.168.8.2";
                endpoint = "192.168.1.2";
                port = 51921;
              };

              roles.peer.machines = {
                peer1 = {};
                peer2 = {};
              };
            };

            wg-test-two = {

              module.name = "@clan/wireguard";

              roles.controller.machines."controller1".settings = {
                # ip = "192.168.9.1";
                endpoint = "192.168.1.1";
                port = 51922;
              };

              roles.peer.machines = {
                peer1 = {};
              };
            };
          };
        };
      };

      defaults =
        { config, ... }:
        {
          #
          #
          #
          # environment.systemPackages = [
          #   config.services.data-mesher.package
          # ];
          #
          # clan.data-mesher.network.interface = "eth1";
          # clan.data-mesher.bootstrapNodes = [
          #   "[2001:db8:1::1]:7946" # peer1
          #   "[2001:db8:1::2]:7946" # peer2
          # ];
          #
          # # speed up for testing
          # services.data-mesher.settings = {
          #   cluster.join_interval = lib.mkForce "2s";
          #   cluster.push_pull_interval = lib.mkForce "5s";
          # };
        };

      nodes = {
        # admin.clan.data-mesher.network.tld = "foo";
      };

      # TODO checks:
      # - peers can reach (ping) controllers
      # - controllers can reach (ping) peers
      # - peers can reach (ping) peers
      # - interfaces are correctly set up:
      #   - wg-test-one on all machines
      #   - wg-test-two on controllerA and peer1
      # - peers are correctly set up

      testScript = ''
        start_all()

        controller1.systemctl("start network-online.target")
        controller1.wait_for_unit("network-online.target")
        controller2.systemctl("start network-online.target")
        controller2.wait_for_unit("network-online.target")
        peer1.systemctl("start network-online.target")
        peer1.wait_for_unit("network-online.target")
        peer2.systemctl("start network-online.target")
        peer2.wait_for_unit("network-online.target")

        # Show all addresses
        controller1.succeed("ip a >&2")
        controller2.succeed("ip a >&2")
        controller1.succeed("ip a show wg-test-one >&2")
        controller2.succeed("ip a show wg-test-one >&2")
        peer1.succeed("ip a show wg-test-one >&2")
        peer2.succeed("ip a show wg-test-one >&2")
        controller1.succeed("ip a show wg-test-two >&2")
        peer1.succeed("ip a show wg-test-two >&2")

        # Show wg configs
        controller1.succeed("wg >&2")
        controller2.succeed("wg >&2")
        peer1.succeed("wg >&2")
        peer2.succeed("wg >&2")

        # Endpoint is reachable
        controller1.succeed("ping -c5 192.168.1.2")
        controller2.succeed("ping -c5 192.168.1.1")

        # Ping from peers to controllers
        peer1.succeed("ping -c5 192.168.8.1")
        peer1.succeed("ping -c5 192.168.9.1")
        peer2.succeed("ping -c5 192.168.8.1")

        # Ping from both controllers on both networks
        # Network one
        controller1.succeed("ping -c5 192.168.8.1") # itself
        controller1.succeed("ping -c5 192.168.8.2") # other controller
        controller1.succeed("ping -c5 192.168.8.3") # peer1
        controller1.succeed("ping -c5 192.168.8.4") # peer2
        controller2.succeed("ping -c5 192.168.8.1") # other controller
        controller2.succeed("ping -c5 192.168.8.2") # itself
        controller2.succeed("ping -c5 192.168.8.3") # peer1
        controller2.succeed("ping -c5 192.168.8.4") # peer2
        # Network two
        controller1.succeed("ping -c5 192.168.9.1") # itself
        controller1.succeed("ping -c5 192.168.9.3") # peer1


        # Ping from peer to contoller
        peer1.succeed("ping -c5 192.168.8.1")
        # peer1.succeed("ping -c5 fc00::1")

        # Ping from peer to peer
        # peer2.succeed("ping -c5 192.168.8.2")
        # peer2.succeed("ping -c5 fc00::1")

        with subtest("Has PSK set"):
          controller1.succeed("wg | grep 'preshared key'")
          controller2.succeed("wg | grep 'preshared key'")
          peer1.succeed("wg | grep 'preshared key'")
          peer2.succeed("wg | grep 'preshared key'")
      '';
    }
  );
}
