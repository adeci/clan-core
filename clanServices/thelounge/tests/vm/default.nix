{
  pkgs,
  nixosLib,
  clan-core,
  ...
}:
nixosLib.runTest (
  { ... }:
  {
    imports = [
      clan-core.modules.nixosVmTest.clanTest
    ];

    hostPkgs = pkgs;

    name = "thelounge";

    clan = {
      directory = ./.;
      modules."@clan/thelounge" = ../../default.nix;
      inventory = {
        machines.server = { };

        instances = {
          thelounge-test = {
            module.name = "@clan/thelounge";
            roles.default.machines."server".settings = { };
          };
        };
      };
    };

    nodes.server = { };

    testScript = ''
      start_all()
      server.wait_for_unit("thelounge")
      server.succeed("${pkgs.netcat}/bin/nc -z -v 127.0.0.1 9000")
    '';
  }
)
