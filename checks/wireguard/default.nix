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
        "controller"
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

            wg-test = {

              module.name = "@clan/wireguard";

              roles.controller.machines."controller".settings = {
                ip = "192.168.8.1";
                endpoint = "192.168.1.1:51920";
              };

              roles.peer.machines = {
                peer1.settings.ip = "192.168.8.2";
                peer2.settings.ip = "192.168.8.3";
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

      testScript = ''
        start_all()

        controller.systemctl("start network-online.target")
        controller.wait_for_unit("network-online.target")
        peer1.systemctl("start network-online.target")
        peer1.wait_for_unit("network-online.target")
        peer2.systemctl("start network-online.target")
        peer2.wait_for_unit("network-online.target")

        # Show all addresses
        controller.succeed("ip a >&2")
        peer1.succeed("ip a show wg-test >&2")
        peer2.succeed("ip a show wg-test >&2")

        controller.succeed("wg >&2")
        peer1.succeed("wg >&2")
        peer2.succeed("wg >&2")

        # Ping from controller
        controller.succeed("ping -c5 192.168.8.1")
        controller.succeed("ping -c5 192.168.8.2")
        controller.succeed("ping -c5 192.168.8.3")

        # Ping from peer to contoller
        peer1.succeed("ping -c5 192.168.8.1")
        # peer1.succeed("ping -c5 fc00::1")

        # Ping from peer to peer
        peer2.succeed("ping -c5 192.168.8.2")
        # peer2.succeed("ping -c5 fc00::1")

        with subtest("Has PSK set"):
          peer1.succeed("wg | grep 'preshared key'")
          peer2.succeed("wg | grep 'preshared key'")
          controller.succeed("wg | grep 'preshared key'")
      '';
    }
  );
}
