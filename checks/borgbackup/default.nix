(
  { ... }:
  {
    name = "borgbackup";

    nodes.machine =
      { self, pkgs, ... }:
      {
        imports = [
          self.clanModules.borgbackup
          self.nixosModules.clanCore
          {
            services.openssh.enable = true;
            services.borgbackup.repos.testrepo = {
              authorizedKeys = [ (builtins.readFile ../assets/ssh/pubkey) ];
            };
          }
          {
            clan.core.settings.directory = ./.;
            clan.core.state.testState.folders = [ "/etc/state" ];
            environment.etc.state.text = "hello world";
            systemd.tmpfiles.settings."vmsecrets" = {
              "/etc/secrets/borgbackup/borgbackup.ssh" = {
                C.argument = "${../assets/ssh/privkey}";
                z = {
                  mode = "0400";
                  user = "root";
                };
              };
              "/etc/secrets/borgbackup/borgbackup.repokey" = {
                C.argument = builtins.toString (pkgs.writeText "repokey" "repokey12345");
                z = {
                  mode = "0400";
                  user = "root";
                };
              };
            };
            # clan.core.facts.secretStore = "vm";
            clan.core.vars.settings.secretStore = "vm";

            clan.borgbackup.destinations.test.repo = "borg@localhost:.";
          }
        ];
      };
    testScript = ''
      start_all()
      machine.systemctl("start --wait borgbackup-job-test.service")
      assert "machine-test" in machine.succeed("BORG_UNKNOWN_UNENCRYPTED_REPO_ACCESS_IS_OK=yes /run/current-system/sw/bin/borg-job-test list")
    '';
  }
)
