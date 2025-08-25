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
            type = lib.types.attrsOf (
              lib.types.submodule {
                options = {
                  description = lib.mkOption {
                    type = lib.types.str;
                    default = "";
                    description = "Human-readable description of the user";
                  };

                  defaultUid = lib.mkOption {
                    type = lib.types.nullOr lib.types.int;
                    default = null;
                    description = "Default UID for the user";
                  };

                  defaultGroups = lib.mkOption {
                    type = lib.types.listOf lib.types.str;
                    default = [ ];
                    description = "Default groups for the user";
                  };

                  sshAuthorizedKeys = lib.mkOption {
                    type = lib.types.listOf lib.types.str;
                    default = [ ];
                    description = "SSH authorized keys for the user";
                  };

                  homeStateVersion = lib.mkOption {
                    type = lib.types.nullOr lib.types.str;
                    default = null;
                    description = "Home-manager stateVersion override. Defaults to system stateVersion if not set.";
                  };

                  defaultPosition = lib.mkOption {
                    type = lib.types.nullOr lib.types.str;
                    default = null;
                    description = "Default position for this user (can be overridden per-machine)";
                  };

                  defaultShell = lib.mkOption {
                    type = lib.types.nullOr lib.types.str;
                    default = null;
                    description = "Default shell for this user (can be overridden per-machine)";
                  };
                };
              }
            );
            default = { };
            description = "User definitions with defaults that can be overridden per-machine";
          };

          machines = lib.mkOption {
            type = lib.types.attrsOf (
              lib.types.submodule {
                options = {
                  users = lib.mkOption {
                    type = lib.types.attrsOf (
                      lib.types.submodule {
                        options = {
                          position = lib.mkOption {
                            type = lib.types.nullOr lib.types.str;
                            default = null;
                            description = "User's position on this machine (defaults to user's defaultPosition)";
                          };

                          uid = lib.mkOption {
                            type = lib.types.nullOr lib.types.int;
                            default = null;
                            description = "UID for this user on this machine";
                          };

                          groups = lib.mkOption {
                            type = lib.types.nullOr (lib.types.listOf lib.types.str);
                            default = null;
                            description = "Groups for this user on this machine (overrides defaults)";
                          };

                          shell = lib.mkOption {
                            type = lib.types.nullOr lib.types.str;
                            default = null;
                            description = "Shell for this user on this machine (defaults to user's defaultShell)";
                          };

                          homeManager = lib.mkOption {
                            type = lib.types.submodule {
                              options = {
                                enable = lib.mkOption {
                                  type = lib.types.bool;
                                  default = false;
                                  description = "Enable home-manager for this user on this machine";
                                };

                                profiles = lib.mkOption {
                                  type = lib.types.listOf lib.types.str;
                                  default = [ ];
                                  description = "Home-manager profiles to load for this user";
                                };
                              };
                            };
                            default = { };
                            description = "Home-manager configuration for this user on this machine";
                          };
                        };
                      }
                    );
                    default = { };
                    description = "Users on this machine with their configurations";
                  };

                  homeManagerOptions = lib.mkOption {
                    type = lib.types.attrsOf lib.types.anything;
                    default = { };
                    description = "Machine-specific home-manager options (e.g., sharedModules)";
                  };
                };
              }
            );
            default = { };
            description = "Machine definitions with user assignments and configurations";
          };

          homeProfilesPath = lib.mkOption {
            type = lib.types.nullOr lib.types.path;
            default = null;
            description = ''
              Path to the home-profiles directory containing user-specific configurations.
              If set, users with homeManager enabled will have their profiles automatically applied based on machine tags.
            '';
          };

          homeManagerOptions = lib.mkOption {
            type = lib.types.submodule {
              options = {
                useGlobalPkgs = lib.mkOption {
                  type = lib.types.bool;
                  default = true;
                  description = "Use the global pkgs configured via system nixpkgs options. Disables Home Manager nixpkgs.* options.";
                };

                useUserPackages = lib.mkOption {
                  type = lib.types.bool;
                  default = true;
                  description = "Install user packages to /etc/profiles instead of ~/.nix-profile. Needed for nixos-rebuild build-vm.";
                };

                backupFileExtension = lib.mkOption {
                  type = lib.types.nullOr lib.types.str;
                  default = null;
                  description = "Extension to append when moving existing files during activation (e.g., 'backup' creates file.backup).";
                };

                verbose = lib.mkOption {
                  type = lib.types.bool;
                  default = false;
                  description = "Enable verbose output during Home Manager activation.";
                };

                enableLegacyProfileManagement = lib.mkOption {
                  type = lib.types.bool;
                  default = false;
                  description = "Enable legacy Nix profile management during activation.";
                };

                sharedModules = lib.mkOption {
                  type = lib.types.listOf lib.types.anything;
                  default = [ ];
                  description = "Extra modules to be applied to all users' Home Manager configurations.";
                };

                extraSpecialArgs = lib.mkOption {
                  type = lib.types.attrs;
                  default = { };
                  description = "Extra specialArgs passed to all Home Manager modules.";
                };
              };
            };
            default = { };
            description = "Home Manager module options for fine-tuning behavior.";
          };

          positionDefinitions = lib.mkOption {
            type = lib.types.attrsOf (
              lib.types.submodule {
                options = {
                  hasRootAccess = lib.mkOption {
                    type = lib.types.bool;
                    default = false;
                    description = "Whether users with this position get sudo/wheel access";
                  };

                  generatePassword = lib.mkOption {
                    type = lib.types.bool;
                    default = false;
                    description = "Whether to use vars to generate passwords for users with this position";
                  };

                  additionalGroups = lib.mkOption {
                    type = lib.types.listOf lib.types.str;
                    default = [ ];
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
              }
            );

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
            userModule = import ./user-module.nix { inherit lib pkgs; };
            homeManagerLib = import ./home-manager.nix { inherit lib; };

            positionDefinitions = settings.positionDefinitions;

            machineName = machine.name;

            # Get machine configuration (if this machine is defined)
            machineConfig = settings.machines.${machineName} or { users = { }; };

            # Get users for this machine with merged user data
            machineUsers = lib.mapAttrs (
              username: machineUserConfig:
              let
                userBase =
                  settings.users.${username}
                    or (throw "User '${username}' referenced in machine '${machineName}' but not defined in users");
              in
              userBase // { machineConfig = machineUserConfig; }
            ) machineConfig.users;

            # Home-manager setup
            homeManagerEnabled = settings.homeProfilesPath != null;
            homeManagerUsers = lib.filterAttrs (
              _username: userCfg: userCfg.machineConfig.homeManager.enable
            ) machineUsers;

            # Build modular user configurations
            processUser =
              username: userConfig:
              let
                # Get position from machine config or user's default
                position = userModule.getUserPosition userConfig (
                  throw "No position defined for user '${username}' on machine '${machineName}'"
                );
                positionConfig = positionDefinitions.${position};
              in
              userModule.buildUserModule machineName username userConfig positionConfig config;

            # Get root SSH keys
            rootAuthorizedKeys = userModule.getRootAuthorizedKeys machineName machineUsers positionDefinitions;

            # Get required shells
            requiredShells = userModule.getRequiredShells machineName machineUsers positionDefinitions;

            # Password generation setup
            usersNeedingPasswords =
              userModule.getUsersWithPasswordGeneration machineName machineUsers
                positionDefinitions;
          in
          {
            imports = lib.optionals homeManagerEnabled [
              clan-core.inputs.home-manager.nixosModules.home-manager
              {
                home-manager = lib.mkMerge [
                  # Core settings from our options
                  {
                    useGlobalPkgs = settings.homeManagerOptions.useGlobalPkgs;
                    useUserPackages = settings.homeManagerOptions.useUserPackages;
                    verbose = settings.homeManagerOptions.verbose;
                    enableLegacyProfileManagement = settings.homeManagerOptions.enableLegacyProfileManagement;
                    sharedModules = settings.homeManagerOptions.sharedModules;

                    # User configurations
                    users = lib.mapAttrs (homeManagerLib.generateHomeConfig settings config.system.stateVersion
                      machineName
                    ) homeManagerUsers;
                  }

                  # Optional settings (only set if not null)
                  (lib.mkIf (settings.homeManagerOptions.backupFileExtension != null) {
                    backupFileExtension = settings.homeManagerOptions.backupFileExtension;
                  })

                  # Merge extraSpecialArgs with our inputs
                  {
                    extraSpecialArgs = settings.homeManagerOptions.extraSpecialArgs // {
                      inherit (args) inputs;
                    };
                  }

                  # Machine-specific home-manager options (e.g., sharedModules for monitor config)
                  (lib.mkIf (machineConfig ? homeManagerOptions) machineConfig.homeManagerOptions)
                ];
              }
            ];

            # User groups (one per user with matching name)
            users.groups = lib.mapAttrs (_username: _: { }) machineUsers;

            # User accounts
            users.users = lib.mkMerge [
              # Regular user accounts
              (lib.mapAttrs processUser machineUsers)

              # Root SSH keys from users with root access
              {
                root.openssh.authorizedKeys.keys = rootAuthorizedKeys;
              }
            ];

            # Enable required shells
            programs = lib.listToAttrs (
              map (shell: {
                name = baseNameOf shell;
                value.enable = true;
              }) requiredShells
            );

            # Password generators for owner position users
            clan.core.vars.generators = lib.mapAttrs' (
              username: _userConfig:
              lib.nameValuePair "user-password-${username}" {
                share = false;
                files."${username}-password-hash" = {
                  secret = true;
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
            ) usersNeedingPasswords;
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
