{ ... }:
{
  _class = "clan.service";

  manifest.name = "clan-core/roster";
  manifest.description = "Holistic user management with position-based access control and home environment configuration";
  manifest.categories = [ "System" ];

  roles.default = {
    interface =
      { lib, ... }:
      {
        options = {
          users = lib.mkOption {
            type = lib.types.attrsOf lib.types.anything;
            default = { };
            description = "User definitions with machine assignments, positions, and home-manager configuration";
          };

          homeProfilesPath = lib.mkOption {
            type = lib.types.nullOr lib.types.path;
            default = null;
            description = ''
              Path to the home-profiles directory containing user-specific configurations.
              If set, users with homeManager enabled will have their profiles automatically applied based on machine tags.
            '';
          };

          positionDefinitions = lib.mkOption {
            type = lib.types.attrsOf (lib.types.submodule {
              options = {
                hasRootAccess = lib.mkOption {
                  type = lib.types.bool;
                  default = false;
                  description = "Whether users with this position get sudo/wheel access";
                };

                generatePassword = lib.mkOption {
                  type = lib.types.bool;
                  default = false;
                  description = "Whether to automatically generate passwords for users with this position";
                };

                additionalGroups = lib.mkOption {
                  type = lib.types.listOf lib.types.str;
                  default = [];
                  description = "Additional groups to add to users with this position";
                };

                isSystemUser = lib.mkOption {
                  type = lib.types.bool;
                  default = false;
                  description = "Whether this position represents a system user account";
                };

                createHome = lib.mkOption {
                  type = lib.types.bool;
                  default = true;
                  description = "Whether to create a home directory for users with this position";
                };

                shell = lib.mkOption {
                  type = lib.types.nullOr lib.types.str;
                  default = null;
                  description = "Default shell for users with this position (e.g., '/bin/false' for service accounts)";
                };

                description = lib.mkOption {
                  type = lib.types.str;
                  default = "";
                  description = "Human-readable description of this position";
                };
              };
            });

            default = {
              owner = {
                hasRootAccess = true;
                generatePassword = true;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
                description = "Primary system administrator with auto-generated password";
              };

              admin = {
                hasRootAccess = true;
                generatePassword = false;
                additionalGroups = [ "wheel" ];
                isSystemUser = false;
                createHome = true;
                description = "Additional administrator without auto-generated password";
              };

              basic = {
                hasRootAccess = false;
                generatePassword = false;
                additionalGroups = [ ];
                isSystemUser = false;
                createHome = true;
                description = "Standard user account without sudo access";
              };

              service = {
                hasRootAccess = false;
                generatePassword = false;
                additionalGroups = [ ];
                isSystemUser = true;
                createHome = false;
                shell = "/bin/false";
                description = "System service account without login capabilities";
              };
            };

            description = ''
              Position definitions for the user hierarchy. Each position defines
              permissions and characteristics for users assigned to it.

              You can override individual settings (e.g., settings.positionDefinitions.admin.generatePassword = true)
              or replace all definitions (e.g., settings.positionDefinitions = lib.mkForce { ... }).
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
            # Import our modules
            userModule = import ./user-module.nix { inherit lib pkgs; };
            homeManagerLib = import ./home-manager.nix { inherit lib; };

            # Position definitions now come from settings
            positionDefinitions = settings.positionDefinitions;

            # Core data
            machineName = machine.name;
            allUsers = settings.users;
            machineUsers = userModule.getMachineUsers machineName allUsers;

            # Home-manager setup
            homeManagerEnabled = settings.homeProfilesPath != null;
            homeManagerUsers = homeManagerLib.filterHomeManagerUsers machineName machineUsers;

            # Build modular user configurations
            processUser = username: userConfig:
              let
                positionConfig = positionDefinitions.${userConfig.machines.${machineName}.position};
              in
                userModule.buildUserModule machineName username userConfig positionConfig config;

            # Get root SSH keys
            rootAuthorizedKeys = userModule.getRootAuthorizedKeys machineName machineUsers positionDefinitions;

            # Get required shells
            requiredShells = userModule.getRequiredShells machineName machineUsers positionDefinitions;

            # Password generation setup
            usersNeedingPasswords = userModule.getUsersWithPasswordGeneration machineName machineUsers positionDefinitions;
          in
            {
            imports = lib.optional homeManagerEnabled clan-core.inputs.home-manager.nixosModules.home-manager;

            # User groups (auto-assigned GIDs by default)
            users.groups = lib.mapAttrs (_username: _: {
              gid = lib.mkDefault null;
            }) machineUsers;

            # User accounts
            users.users = lib.mapAttrs processUser machineUsers // {
              root = {
                openssh.authorizedKeys.keys = rootAuthorizedKeys;
              };
            };

            # Enable required shells
            programs = lib.listToAttrs (
              map (shell: {
                name = baseNameOf shell;
                value.enable = true;
              }) requiredShells
            );

            # Home-manager configuration
            home-manager = lib.mkIf homeManagerEnabled {
              useGlobalPkgs = true;
              useUserPackages = true;
              users = lib.mapAttrs 
                (homeManagerLib.generateHomeConfig settings machineName) 
                homeManagerUsers;
              extraSpecialArgs = { inherit (args) inputs; };
            };

            # Password generators for owner position users
            clan.core.vars.generators =
              lib.mapAttrs'
              (username: _userConfig:
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
              usersNeedingPasswords;
          };
      };
  };

  perMachine = {
    nixosModule = {
      # Disable mutable users for declarative user management
      users.mutableUsers = false;
    };
  };
}
