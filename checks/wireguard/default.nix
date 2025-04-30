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

            /*
                            wg-test-one
              ┌───────────────────────────────┐
              │            ◄─────────────     │
              │ controller2              controller1
              │    ▲       ─────────────►    ▲     ▲
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ └───────────────┐ │ │   │ │
              │    │ │ └──────────────┐  │ │ │   │ │
              │      ▼                │  ▼ ▼     ▼
              └─► peer2               │  peer1  peer3
                                      │          ▲
                                      └──────────┘
            */

            wg-test-one = {

              module.name = "@clan/wireguard";

              roles.controller.machines."controller1".settings = {
                endpoint = "192.168.1.1";
              };

              roles.controller.machines."controller2".settings = {
                endpoint = "192.168.1.2";
              };

              roles.peer.machines = {
                peer1.settings.controller = "controller1";
                peer2.settings.controller = "controller2";
                peer3.settings.controller = "controller1";
              };
            };

            # wg-test-two = {
            #
            #   module.name = "@clan/wireguard";
            #
            #   roles.controller.machines."controller1".settings = {
            #     endpoint = "192.168.1.1";
            #     port = 51922;
            #   };
            #
            #   roles.peer.machines = {
            #     peer1 = { };
            #   };
            # };
          };
        };
      };

      defaults =
        { config, ... }:
        {

          # TODO remove
          console.keyMap = "colemak";

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
        peer3.systemctl("start network-online.target")
        peer3.wait_for_unit("network-online.target")

        # Show all addresses
        controller1.succeed("ip a >&2")
        controller2.succeed("ip a >&2")
        controller1.succeed("ip a show wg-test-one >&2")
        controller2.succeed("ip a show wg-test-one >&2")
        peer1.succeed("ip a show wg-test-one >&2")
        peer2.succeed("ip a show wg-test-one >&2")
        peer3.succeed("ip a show wg-test-one >&2")

        controller1.succeed("cat /etc/hosts >&2")
        controller2.succeed("cat /etc/hosts >&2")
        peer1.succeed("cat /etc/hosts >&2")
        peer2.succeed("cat /etc/hosts >&2")
        peer3.succeed("cat /etc/hosts >&2")

        # Show wg configs
        controller1.succeed("wg >&2")
        controller2.succeed("wg >&2")
        peer1.succeed("wg >&2")
        peer2.succeed("wg >&2")
        peer3.succeed("wg >&2")

        # Endpoints are reachable
        controller1.succeed("ping -c1 192.168.1.2")
        controller2.succeed("ping -c1 192.168.1.1")

        with subtest("Controllers can reach everything"):
          controller1.succeed("ping -c1 controller1.wg-test-one >&2")
          controller1.succeed("ping -c1 controller2.wg-test-one >&2")
          controller1.succeed("ping -c1 peer1.wg-test-one")
          controller1.succeed("ping -c1 peer2.wg-test-one")
          controller1.succeed("ping -c1 peer3.wg-test-one")
          controller2.succeed("ping -c1 controller1.wg-test-one")
          controller2.succeed("ping -c1 controller2.wg-test-one")
          controller2.succeed("ping -c1 peer1.wg-test-one")
          controller2.succeed("ping -c1 peer2.wg-test-one")
          controller2.succeed("ping -c1 peer3.wg-test-one")

        with subtest("Peers can reach both controllers"):
          peer1.succeed("ping -c1 controller1.wg-test-one >&2")
          peer1.succeed("ping -c1 controller2.wg-test-one")
          peer2.succeed("ping -c1 controller1.wg-test-one")
          peer2.succeed("ping -c1 controller2.wg-test-one")
          peer3.succeed("ping -c1 controller1.wg-test-one")
          peer3.succeed("ping -c1 controller2.wg-test-one")

        with subtest("Peers can reach other peers"):
          peer1.succeed("ping -c1 peer1.wg-test-one >&2")
          peer1.succeed("ping -c1 peer2.wg-test-one >&2")
          peer1.succeed("ping -c1 peer3.wg-test-one >&2")
          peer2.succeed("ping -c1 peer1.wg-test-one >&2")
          peer2.succeed("ping -c1 peer2.wg-test-one >&2")
          peer2.succeed("ping -c1 peer3.wg-test-one >&2")
          peer3.succeed("ping -c1 peer1.wg-test-one >&2")
          peer3.succeed("ping -c1 peer2.wg-test-one >&2")
          peer3.succeed("ping -c1 peer3.wg-test-one >&2")

      '';
    }
  );
}
