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
          zerotier-redux = lib.modules.importApply ../../clanModules/zerotier-redux/default.nix { inherit (self) packages; };
        };

        instances = {
          "test" = {
            module.name = "zerotier-redux";
            module.input = null;

            roles.controller.machines."controller1" = { };
            # TODO: figure out how to implizitly make all machines peers by default
            roles.peer.machines."controller1" = { };
            roles.peer.machines."peer1" = { };
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
