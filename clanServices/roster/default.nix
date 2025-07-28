{ ... }:
{
  _class = "clan.service";

  manifest.name = "clan-core/roster";
  manifest.description = "Holistic user management with role-based access control and home environment configuration";
  manifest.categories = [ "System" ];

  roles.default = {
    interface =
      { lib, ... }:
      {
        options = {
          users = lib.mkOption {
            type = lib.types.attrsOf lib.types.anything;
            default = { };
            description = "User definitions with machine assignments, roles, and home-manager configuration";
          };

          homeProfilesPath = lib.mkOption {
            type = lib.types.nullOr lib.types.path;
            default = null;
            description = ''
              Path to the home-profiles directory containing user-specific configurations.
              If set, users with homeManager enabled will have their profiles automatically applied based on machine tags.
            '';
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
            clan-core,
            ...
          }@args:
          let
            roleDefinitions = {
              owner = {
                hasRootAccess = true;
                generatePassword = true;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
              };
              admin = {
                hasRootAccess = true;
                generatePassword = false;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
              };
              basic = {
                hasRootAccess = false;
                generatePassword = false;
                additionalGroups = [ ];
                isSystemUser = false;
                createHome = true;
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
                  else if roleConfig ? shell && roleConfig.shell != null then
                    roleConfig.shell
                  else
                    null;
              in
              {
                isNormalUser = !roleConfig.isSystemUser;
                isSystemUser = roleConfig.isSystemUser;
                uid = lib.mkForce finalUid;
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

            homeManagerEnabled = settings.homeProfilesPath != null;

            homeManagerUsers = lib.filterAttrs (
              _username: userCfg:
              let
                hmConfig = userCfg.machines.${machineName}.homeManager or false;
              in
              (builtins.isBool hmConfig && hmConfig) || (builtins.isAttrs hmConfig && (hmConfig.enable or false))
            ) machineUsers;

            generateHomeConfig =
              username: userConfig:
              let
                userProfilePath = settings.homeProfilesPath + "/${username}";

                stateVersion =
                  if builtins.pathExists (userProfilePath + "/stateVersion.nix") then
                    import (userProfilePath + "/stateVersion.nix")
                  else
                    "24.05";

                homeManagerConfig = userConfig.machines.${machineName}.homeManager or false;
                userProfiles =
                  if builtins.isBool homeManagerConfig then [ "base" ] else homeManagerConfig.profiles or [ "base" ];

                profileItems =
                  if builtins.pathExists userProfilePath then builtins.readDir userProfilePath else { };

                profileDirs = lib.filterAttrs (
                  name: type: type == "directory" && lib.elem name userProfiles
                ) profileItems;

                rootNixFiles = lib.filterAttrs (
                  name: type: type == "regular" && lib.hasSuffix ".nix" name && name != "stateVersion.nix"
                ) profileItems;

                loadProfileDirs = lib.mkMerge (
                  lib.mapAttrsToList (
                    profileName: _:
                    let
                      profileDir = userProfilePath + "/${profileName}";
                      nixFiles = lib.filterAttrs (name: type: type == "regular" && lib.hasSuffix ".nix" name) (
                        builtins.readDir profileDir
                      );
                      configs = lib.mapAttrsToList (name: _: import (profileDir + "/${name}")) nixFiles;
                    in
                    lib.mkMerge configs
                  ) profileDirs
                );

                loadRootFiles = lib.mkMerge (
                  lib.mapAttrsToList (name: _: import (userProfilePath + "/${name}")) rootNixFiles
                );

                loadAllProfiles = lib.mkMerge [
                  loadProfileDirs
                  loadRootFiles
                ];
              in
              lib.mkMerge [
                {
                  home.stateVersion = stateVersion;
                }
                loadAllProfiles
              ];

          in
          {
            imports = lib.optional homeManagerEnabled clan-core.inputs.home-manager.nixosModules.home-manager;

            users.groups = lib.mapAttrs (_username: _: {
              gid = lib.mkForce null;
            }) machineUsers;

            users.users = lib.mapAttrs processUser machineUsers // {
              root = {
                openssh.authorizedKeys.keys = rootAuthorizedKeys;
              };
            };

            programs =
              let
                shellList = lib.unique (
                  lib.filter (s: s != null && s != "/bin/false") (
                    lib.mapAttrsToList (
                      _: user:
                      let
                        machineConfig = user.machines.${machineName};
                        roleConfig = roleDefinitions.${machineConfig.role};
                      in
                      if machineConfig ? shell && machineConfig.shell != null then
                        machineConfig.shell
                      else
                        roleConfig.shell
                    ) machineUsers
                  )
                );
              in
              lib.listToAttrs (
                map (shell: {
                  name = baseNameOf shell;
                  value.enable = true;
                }) shellList
              );

            home-manager = lib.mkIf homeManagerEnabled {
              useGlobalPkgs = true;
              useUserPackages = true;
              users = lib.mapAttrs generateHomeConfig homeManagerUsers;
              extraSpecialArgs = { inherit (args) inputs; };
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
                        xkcdpass \
                          --numwords 3 \
                          --delimiter - \
                          --count 1 \
                          | tr -d "\n" > "$out"/${username}-password
                      fi

                      mkpasswd -s -m sha-512 \
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
