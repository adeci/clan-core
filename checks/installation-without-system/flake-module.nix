{
  self,
  lib,
  ...
}:
{
  # The purpose of this test is to ensure `clan machines install` works
  # for machines that don't have a hardware config yet.

  # If this test starts failing it could be due to the `facter.json` being out of date
  # you can get a new one by adding
  # client.fail("cat test-flake/machines/test-install-machine/facter.json >&2")
  # to the installation test.
  clan.machines.test-install-machine-without-system = {
    fileSystems."/".device = lib.mkDefault "/dev/vda";
    boot.loader.grub.device = lib.mkDefault "/dev/vda";

    imports = [ self.nixosModules.test-install-machine-without-system ];
  };
  clan.machines.test-install-machine-with-system = {
    facter.reportPath = ./facter.json;

    fileSystems."/".device = lib.mkDefault "/dev/vda";
    boot.loader.grub.device = lib.mkDefault "/dev/vda";

    imports = [ self.nixosModules.test-install-machine-without-system ];
  };
  flake.nixosModules = {
    test-install-machine-without-system =
      { lib, modulesPath, ... }:
      {
        imports = [
          (modulesPath + "/testing/test-instrumentation.nix") # we need these 2 modules always to be able to run the tests
          (modulesPath + "/profiles/qemu-guest.nix")
          ../lib/minify.nix
        ];

        networking.hostName = "test-install-machine";

        environment.etc."install-successful".text = "ok";

        boot.consoleLogLevel = lib.mkForce 100;
        boot.kernelParams = [ "boot.shell_on_fail" ];

        # disko config
        boot.loader.grub.efiSupport = lib.mkDefault true;
        boot.loader.grub.efiInstallAsRemovable = lib.mkDefault true;
        clan.core.vars.settings.secretStore = "vm";
        clan.core.vars.generators.test = {
          files.test.neededFor = "partitioning";
          script = ''
            echo "notok" > $out/test
          '';
        };
        disko.devices = {
          disk = {
            main = {
              type = "disk";
              device = "/dev/vda";

              preCreateHook = ''
                test -e /run/partitioning-secrets/test/test
              '';

              content = {
                type = "gpt";
                partitions = {
                  boot = {
                    size = "1M";
                    type = "EF02"; # for grub MBR
                    priority = 1;
                  };
                  ESP = {
                    size = "512M";
                    type = "EF00";
                    content = {
                      type = "filesystem";
                      format = "vfat";
                      mountpoint = "/boot";
                      mountOptions = [ "umask=0077" ];
                    };
                  };
                  root = {
                    size = "100%";
                    content = {
                      type = "filesystem";
                      format = "ext4";
                      mountpoint = "/";
                    };
                  };
                };
              };
            };
          };
        };
      };
  };
  perSystem =
    {
      pkgs,
      lib,
      ...
    }:
    let
      dependencies = [
        self
        self.nixosConfigurations.test-install-machine-with-system.config.system.build.toplevel
        self.nixosConfigurations.test-install-machine-with-system.config.system.build.diskoScript
        self.nixosConfigurations.test-install-machine-with-system.config.system.clan.deployment.file
        pkgs.stdenv.drvPath
        pkgs.bash.drvPath
        pkgs.nixos-anywhere
        pkgs.bubblewrap
      ] ++ builtins.map (i: i.outPath) (builtins.attrValues self.inputs);
      closureInfo = pkgs.closureInfo { rootPaths = dependencies; };
    in
    {
      # On aarch64-linux, hangs on reboot with after installation:
      # vm-test-run-test-installation> (finished: waiting for the VM to power off, in 1.97 seconds)
      # vm-test-run-test-installation>
      # vm-test-run-test-installation> new_machine: must succeed: cat /etc/install-successful
      # vm-test-run-test-installation> new_machine: waiting for the VM to finish booting
      # vm-test-run-test-installation> new_machine: starting vm
      # vm-test-run-test-installation> new_machine: QEMU running (pid 80)
      # vm-test-run-test-installation> new_machine: Guest root shell did not produce any data yet...
      # vm-test-run-test-installation> new_machine:   To debug, enter the VM and run 'systemctl status backdoor.service'.
      checks = pkgs.lib.mkIf (pkgs.stdenv.isLinux && pkgs.stdenv.hostPlatform.system != "aarch64-linux") {
        test-installation-without-system = (import ../lib/test-base.nix) {
          name = "test-installation-without-system";
          nodes.target = {
            services.openssh.enable = true;
            virtualisation.diskImage = "./target.qcow2";
            virtualisation.useBootLoader = true;

            # virtualisation.fileSystems."/" = {
            #   device = "/dev/disk/by-label/this-is-not-real-and-will-never-be-used";
            #   fsType = "ext4";
            # };
          };
          nodes.installer =
            { modulesPath, ... }:
            {
              imports = [
                (modulesPath + "/../tests/common/auto-format-root-device.nix")
              ];
              services.openssh.enable = true;
              users.users.root.openssh.authorizedKeys.keyFiles = [ ../lib/ssh/pubkey ];
              system.nixos.variant_id = "installer";
              environment.systemPackages = [ pkgs.nixos-facter ];
              virtualisation.emptyDiskImages = [ 512 ];
              virtualisation.diskSize = 8 * 1024;
              virtualisation.rootDevice = "/dev/vdb";
              # both installer and target need to use the same diskImage
              virtualisation.diskImage = "./target.qcow2";
              nix.settings = {
                substituters = lib.mkForce [ ];
                hashed-mirrors = null;
                connect-timeout = lib.mkForce 3;
                flake-registry = pkgs.writeText "flake-registry" ''{"flakes":[],"version":2}'';
                experimental-features = [
                  "nix-command"
                  "flakes"
                ];
              };
              system.extraDependencies = dependencies;
            };
          nodes.client = {
            environment.systemPackages = [
              self.packages.${pkgs.system}.clan-cli
            ] ++ self.packages.${pkgs.system}.clan-cli.runtimeDependencies;
            environment.etc."install-closure".source = "${closureInfo}/store-paths";
            virtualisation.memorySize = 2048;
            nix.settings = {
              substituters = lib.mkForce [ ];
              hashed-mirrors = null;
              connect-timeout = lib.mkForce 3;
              flake-registry = pkgs.writeText "flake-registry" ''{"flakes":[],"version":2}'';
              experimental-features = [
                "nix-command"
                "flakes"
              ];
            };
            system.extraDependencies = dependencies;
          };

          testScript = ''
            client.start()
            installer.start()

            client.succeed("${pkgs.coreutils}/bin/install -Dm 600 ${../lib/ssh/privkey} /root/.ssh/id_ed25519")
            client.wait_until_succeeds("timeout 2 ssh -o StrictHostKeyChecking=accept-new -v root@installer hostname")
            client.succeed("cp -r ${../..} test-flake && chmod -R +w test-flake")
            client.fail("test -f test-flake/machines/test-install-machine-without-system/hardware-configuration.nix")
            client.fail("test -f test-flake/machines/test-install-machine-without-system/facter.json")
            client.succeed("clan machines install --debug --flake test-flake --yes test-install-machine-without-system --target-host root@installer --update-hardware-config nixos-facter >&2")
            try:
              installer.shutdown()
            except BrokenPipeError:
              # qemu has already exited
              pass

            target.state_dir = installer.state_dir
            target.start()
            target.wait_for_unit("multi-user.target")
            assert(target.succeed("cat /etc/install-successful").strip() == "ok")
          '';
        } { inherit pkgs self; };
      };
    };
}
