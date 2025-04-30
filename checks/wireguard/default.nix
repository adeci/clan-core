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

            # TODO: Will this actually work with conflicting ports? Can we re-use interfaces?
            #wg-test-two = {
            #  module.name = "@clan/wireguard";

            #  roles.controller.machines."controller1".settings = {
            #    endpoint = "192.168.1.1";
            #    port = 51922;
            #  };

            #  roles.peer.machines = {
            #    peer1 = { };
            #  };
            #};
          };
        };
      };

      testScript = ''
        start_all()

        # Show all addresses
        machines = [peer1, peer2, peer3, controller1, controller2]
        for m in machines:
            m.systemctl("start network-online.target")

        for m in machines:
            m.wait_for_unit("network-online.target")
            m.succeed("ip a >&2; ip -6 r >&2; wg >&2")

        for m1 in machines:
            for m2 in machines:
                if m1 != m2:
                    m1.succeed(f"ping -c1 {m2.name} >&2")
      '';
    }
  );
}
