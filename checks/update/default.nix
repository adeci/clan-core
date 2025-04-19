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
        "machine"
      ];
    in
    {
      name = "update";

      clan = {
        directory = ./.;
        inventory = {
          machines = lib.genAttrs machines (_: { });
        };
      };

      defaults =
        { ... }:
        {
          environment.systemPackages = [ self.packages.${pkgs.hostPlatform.system}.clan-cli-full ];
          services.openssh.enable = true;
        };

      nodes = {
        machine-updated = {
          environment.etc."testfile".text = "updated";
        };
      };

      testScript = ''
        start_all()
        machine.wait_for_open_port(22)

        machine.fail("cat /etc/testfile")
        machine.succeed("env CLAN_DIR=${self} clan machines update test-update-machine-${pkgs.hostPlatform.system} --debug")
        assert machine.succeed("cat /etc/testfile") == "updated"
      '';
    }
  );
}
