{ ... }:
{
  _class = "clan.service";

  manifest.name = "clan-core/user-assignments";
  manifest.description = "Centralized user assignment to machines with role-based access control";
  manifest.categories = [ "System" ];

  roles.default = {
    interface =
      { lib, ... }:
      {
        options = {
          users = lib.mkOption {
            type = lib.types.attrsOf lib.types.anything;
            default = { };
            description = "User definitions with machine assignments and roles";
          };
        };
      };

    perInstance =
      { settings, machine, ... }:
      {

        nixosModule =
          {
            config,
            lib,
            pkgs,
            ...
          }:
          let
            roleDefinitions = {
              owner = {
                hasRootAccess = true;
                generatePassword = true;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
                shell = null;
              };
              admin = {
                hasRootAccess = true;
                generatePassword = false;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
                shell = null;
              };
              basic = {
                hasRootAccess = false;
                generatePassword = false;
                additionalGroups = [ ];
                isSystemUser = false;
                createHome = true;
                shell = null;
              };
              service = {
                hasRootAccess = false;
                generatePassword = false;
                additionalGroups = [ ];
                isSystemUser = true;
                createHome = false;
                shell = "/bin/false";
              };
            };

            allUsers = settings.users;
            machineName = machine.name;

            machineUsers = lib.filterAttrs (_username: userCfg: userCfg.machines ? ${machineName}) allUsers;

            processUser =
              username: userConfig:
              let
                machineConfig = userConfig.machines.${machineName};
                roleConfig = roleDefinitions.${machineConfig.role};

                baseGroups =
                  if machineConfig ? groups && machineConfig.groups != null then
                    machineConfig.groups
                  else
                    userConfig.defaultGroups;
                finalGroups = baseGroups ++ roleConfig.additionalGroups;

                finalUid =
                  if machineConfig ? uid && machineConfig.uid != null then
                    machineConfig.uid
                  else
                    userConfig.defaultUid;

                finalShell =
                  if machineConfig ? shell && machineConfig.shell != null then
                    machineConfig.shell
                  else if roleConfig.shell != null then
                    roleConfig.shell
                  else
                    null;
              in
              {
                isNormalUser = !roleConfig.isSystemUser;
                isSystemUser = roleConfig.isSystemUser;
                uid = finalUid;
                group = username;
                extraGroups = finalGroups;
                createHome = roleConfig.createHome;
                openssh.authorizedKeys.keys = userConfig.sshAuthorizedKeys;
                description = userConfig.description;

                hashedPasswordFile =
                  if roleConfig.generatePassword then
                    config.clan.core.vars.generators."user-password-${username}".files."${username}-password-hash".path
                  else
                    null;
              }
              // lib.optionalAttrs (finalShell != null) {
                shell = pkgs.${baseNameOf finalShell};
              };

            rootAuthorizedKeys = lib.concatLists (
              lib.mapAttrsToList (
                _username: userConfig:
                let
                  machineConfig = userConfig.machines.${machineName};
                  roleConfig = roleDefinitions.${machineConfig.role};
                in
                if roleConfig.hasRootAccess then userConfig.sshAuthorizedKeys else [ ]
              ) machineUsers
            );

          in
          {
            users.groups = lib.mapAttrs (_username: _: {
              gid = null;
            }) machineUsers;

            users.users = lib.mapAttrs processUser machineUsers // {
              root = {
                openssh.authorizedKeys.keys = rootAuthorizedKeys;
              };
            };

            clan.core.vars.generators =
              lib.mapAttrs'
                (
                  username: _userConfig:
                  lib.nameValuePair "user-password-${username}" {
                    share = false;
                    files."${username}-password-hash" = {
                      secret = false;
                      neededFor = "users";
                    };
                    files."${username}-password" = {
                      secret = true;
                      deploy = false;
                    };
                    prompts."${username}-password" = {
                      type = "hidden";
                      persist = true;
                      description = "Password for user ${username}. Leave blank to autogenerate.";
                    };
                    script = ''
                      set -euo pipefail

                      prompt_value=$(cat "$prompts"/${username}-password)

                      if [[ -n "''${prompt_value-}" ]]; then
                        echo "$prompt_value" | tr -d "\n" > "$out"/${username}-password
                      else
                        ${pkgs.xkcdpass}/bin/xkcdpass \
                          --numwords 3 \
                          --delimiter - \
                          --count 1 \
                          | tr -d "\n" > "$out"/${username}-password
                      fi

                      ${pkgs.mkpasswd}/bin/mkpasswd -s -m sha-512 \
                        < "$out"/${username}-password \
                        | tr -d "\n" > "$out"/${username}-password-hash
                    '';
                    runtimeInputs = [
                      pkgs.xkcdpass
                      pkgs.mkpasswd
                    ];
                  }
                )
                (
                  lib.filterAttrs (
                    _username: userConfig:
                    let
                      machineConfig = userConfig.machines.${machineName};
                      roleConfig = roleDefinitions.${machineConfig.role};
                    in
                    roleConfig.generatePassword
                  ) machineUsers
                );
          };
      };
  };

  perMachine = {
    nixosModule = {
      users.mutableUsers = false;
    };
  };
}
