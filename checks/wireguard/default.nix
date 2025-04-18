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
                # endpoint = "vpn.pablo.tools:51820";
              };

              roles.peer.machines = {
                peer1.settings.ip = "192.168.8.1";
                peer2.settings.ip = "192.168.8.2";
                # peer2.settings.extraIPs = [ "192.168.2.0/24" ];
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

      # TODO Add better test script.
      testScript = ''

        start_all()

        controller.wait_for_unit("wireguard")
        peer1.wait_for_unit("wireguard")
        peer2.wait_for_unit("wireguard")

      '';
    }
  );
}
