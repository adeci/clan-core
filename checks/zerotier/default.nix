(import ../lib/test-inventory.nix) (
  { self, lib, ... }:
  let

    machines = [
      "peer1"
      "controller1"
    ];
  in
  {
    name = "zerotier-redux";

    inventory = {
      inventory = {
        machines = lib.genAttrs machines (_: { });

        modules = {
          zerotier-redux = ../../clanModules/zerotier-redux/default.nix;
        };

        instances = {
          "test" = {
            module.name = "zerotier-redux";
            roles.controller.machines."jon" = { };
            roles.peer.machines."jon" = { };
          };
        };

      };
      directory = ./.;
    };

    defaults = {
      # No defaults needed
    };

    nodes = {
      # options for the nodes
    };

    # TODO Add better test script.
    testScript = ''
      start_all()
    '';
  }
)
