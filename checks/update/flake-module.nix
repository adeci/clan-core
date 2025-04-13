{
  self,
  config,
  lib,
  ...
}:
{
  clan.machines = lib.listToAttrs (
    lib.map (
      system:
      let
        configuration = self.checks.${system}.update.nodes.machine.system.build.extendModules { };
      in
      lib.nameValuePair "test-update-machine-${system}" {
        disabledModules = [ { key = "no-switch-to-configuration"; } ];

        imports = configuration._module.args.modules ++ configuration._module.args.baseModules;

        config = {
          _module.args = { inherit (configuration._module.args) name; };

          networking.hostName = lib.mkForce "machine";
          clan.core.settings.machine.name = lib.mkForce "machine";

          clan.core.networking.targetHost = "root@machine";

          virtualisation.bootLoaderDevice = "/dev/vda";

          environment.etc."testfile".text = "updated";
        };
      }
    ) (lib.filter (lib.hasSuffix "linux") config.systems)
  );

  perSystem =
    {
      pkgs,
      ...
    }:
    {
      checks = pkgs.lib.mkIf (pkgs.stdenv.isLinux && !pkgs.stdenv.isAarch64) {
        update = (import ../lib/test-base.nix) {
          name = "update";

          nodes = {
            machine =
              { pkgs, extendModules, ... }:
              let
                dependencies = [
                  self
                  pkgs.stdenv.drvPath
                  pkgs.stdenvNoCC
                  self.nixosConfigurations."test-update-machine-${pkgs.hostPlatform.system}".config.system.build.toplevel
                  self.nixosConfigurations."test-update-machine-${pkgs.hostPlatform.system}".config.system.clan.deployment.file
                ] ++ builtins.map (i: i.outPath) (builtins.attrValues self.inputs);
                closureInfo = pkgs.closureInfo { rootPaths = dependencies; };

                inherit (import "${pkgs.path}/nixos/tests/ssh-keys.nix" pkgs)
                  snakeOilEd25519PrivateKey
                  snakeOilEd25519PublicKey
                  ;
              in
              {
                environment.etc."install-closure".source = "${closureInfo}/store-paths";
                system.extraDependencies = dependencies;
                virtualisation.memorySize = 2048;
                environment.systemPackages = [ self.packages.${pkgs.hostPlatform.system}.clan-cli-full ];
                system.build = { inherit extendModules; };

                services.openssh.enable = true;
                users.users.root.openssh.authorizedKeys.keys = [
                  snakeOilEd25519PublicKey
                ];

                system.build.privateKey = snakeOilEd25519PrivateKey;
              };
          };
          testScript =
            { nodes, ... }:
            let
              sshConfig = builtins.toFile "ssh.conf" ''
                UserKnownHostsFile=/dev/null
                StrictHostKeyChecking=no
              '';
            in
            ''
              start_all()
              machine.wait_for_open_port(22)

              machine.fail("${lib.getExe pkgs.tree} /dev/disk")

              machine.succeed("install -Dm 600 ${nodes.machine.system.build.privateKey} ~root/.ssh/id_ed25519")
              machine.succeed("install ${sshConfig} ~root/.ssh/config")

              machine.fail("cat /etc/testfile")
              machine.succeed("env CLAN_DIR=${self} clan machines update test-update-machine-${pkgs.hostPlatform.system} --debug")
              assert machine.succeed("cat /etc/testfile") == "updated"
            '';
        } { inherit pkgs self; };
      };
    };
}
