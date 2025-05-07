{
  lib,
  config,
  options,
  ...
}:
let
  types = lib.types;

  metaOptionsWith = name: {
    name = lib.mkOption {
      type = types.str;
      default = name;
      description = ''
        Name of the machine or service
      '';
    };
    description = lib.mkOption {
      default = null;
      type = types.nullOr types.str;
      description = ''
        Optional freeform description
      '';
    };
    icon = lib.mkOption {
      default = null;
      type = types.nullOr types.str;
      description = ''
        Under construction, will be used for the UI
      '';
    };
  };

  moduleConfig = lib.mkOption {
    default = { };
    # TODO: use types.deferredModule
    # clan.borgbackup MUST be defined as submodule
    type = types.attrsOf types.anything;
    description = ''
      Configuration of the specific clanModule.

      !!! Note
        Configuration is passed to the nixos configuration scoped to the module.

        ```nix
          clan.<serviceName> = { ... # Config }
        ```
    '';
  };

  extraModulesOption = lib.mkOption {
    description = ''
      List of additionally imported `.nix` expressions.

      Supported types:

      - **Strings**: Interpreted relative to the 'directory' passed to buildClan.
      - **Paths**: should be relative to the current file.
      - **Any**: Nix expression must be serializable to JSON.

      !!! Note
          **The import only happens if the machine is part of the service or role.**

      Other types are passed through to the nixos configuration.

      ???+ Example
          To import the `special.nix` file

          ```
          . Clan Directory
          ├── flake.nix
          ...
          └── modules
              ├── special.nix
              └── ...
          ```

          ```nix
          {
            extraModules = [ "modules/special.nix" ];
          }
          ```
    '';
    apply = value: if lib.isString value then value else builtins.seq (builtins.toJSON value) value;
    default = [ ];
    type = types.listOf (
      types.oneOf [
        types.str
        types.anything
      ]
    );
  };
in
{
  imports = [
    ./assertions.nix
  ];
  options = {
    _legacyModules = lib.mkOption {
      internal = true;
      visible = false;
      default = { };
    };

    options = lib.mkOption {
      internal = true;
      visible = false;
      type = types.raw;
      default = options;
    };
    modules = lib.mkOption {
      # Don't define the type yet
      # We manually transform the value with types.deferredModule.merge later to keep them serializable
      type = types.attrsOf types.raw;
      default = { };
      defaultText = "clanModules of clan-core";
      description = ''
        A mapping of module names to their path.

        Each module can be referenced by its `attributeName` in the `inventory.services` attribute set.

        !!! Important
            Each module MUST fulfill the following requirements to be usable with the inventory:

            - The module MUST have a `README.md` file with a `description`.
            - The module MUST have at least `features = [ "inventory" ]` in the frontmatter section.
            - The module MUST have a subfolder `roles` with at least one `{roleName}.nix` file.

            For further information see: [Module Authoring Guide](../../authoring/clanServices/index.md).

        ???+ example
            ```nix
            buildClan {
                # 1. Add the module to the available inventory modules
                inventory.modules = {
                  custom-module = ./modules/my_module;
                };
                # 2. Use the module in the inventory
                inventory.services = {
                  custom-module.instance_1 = {
                      roles.default.machines = [ "machineA" ];
                  };
                };
            };
            ```
      '';

      apply =
        moduleSet:
        let
          allowedNames = lib.attrNames config._legacyModules;
        in
        if builtins.all (moduleName: builtins.elem moduleName allowedNames) (lib.attrNames moduleSet) then
          moduleSet
        else
          lib.warn ''
            `inventory.modules` will be deprecated soon.

            Please migrate the following modules into `clan.service` modules
            and register them in `clan.modules`

            ${lib.concatStringsSep "\n" (
              map (m: "'${m}'") (lib.attrNames (lib.filterAttrs (n: _v: !builtins.elem n allowedNames) moduleSet))
            )}

            See: https://docs.clan.lol/manual/distributed-services/
            And: https://docs.clan.lol/authoring/clanServices/
          '' moduleSet;
    };

    assertions = lib.mkOption {
      type = types.listOf types.unspecified;
      internal = true;
      visible = false;
      default = [ ];
    };
    meta = lib.mkOption {
      type = lib.types.submoduleWith {
        modules = [
          ./meta-interface.nix
        ];
      };
    };
    tags = lib.mkOption {
      default = { };
      description = ''
        Tags of the inventory are used to group machines together.

        It is recommended to use [`machine.tags`](#inventory.machines.tags) to define the tags of the machines.

        This can be used to define custom tags that are either statically set or dynamically computed.

        #### Static Tags

        ???+ example "Static Tag Example"
            ```nix
            inventory.tags = {
              foo = [ "machineA" "machineB" ];
            };
            ```

            The tag `foo` will always be added to `machineA` and `machineB`.

        #### Dynamic Tags

        It is possible to compute tags based on the machines properties or based on other tags.

        !!! danger
            This is a powerful feature and should be used with caution.

            It is possible to cause infinite recursion by computing tags based on the machines properties or based on other tags.

        ???+ example "Dynamic Tag Example"

            allButFoo is a computed tag. It will be added to all machines except 'foo'

            `all` is a predefined tag. See the docs of [`tags.all`](#inventory.tags.all).

            ```nix
            #  inventory.tags ↓       ↓ inventory.machines
            inventory.tags = {config, machines...}: {
              #                                                        ↓↓↓ The "all" tag
              allButFoo = builtins.filter (name: name != "foo") config.all;
            };
            ```

        !!! warning
            Do NOT compute `tags` from `machine.tags` this will cause infinite recursion.
      '';
      type = types.submoduleWith {
        specialArgs = {
          inherit (config) machines;
        };
        modules = [
          {
            freeformType = with lib.types; lazyAttrsOf (listOf str);
            # Reserved tags
            # Defined as options here to show them in advance
            options = {
              # 'All machines' tag
              all = lib.mkOption {
                type = with lib.types; listOf str;
                defaultText = "[ <All Machines> ]";
                description = ''
                  !!! example "Predefined Tag"

                      Will be added to all machines

                      ```nix
                      inventory.machines.machineA.tags = [ "all" ];
                      ```
                '';
              };
              nixos = lib.mkOption {
                type = with lib.types; listOf str;
                defaultText = "[ <All NixOS Machines> ]";
                description = ''
                  !!! example "Predefined Tag"

                      Will be added to all machines that set `machineClass = "darwin"`

                      ```nix
                      inventory.machines.machineA.tags = [ "nixos" ];
                      ```
                '';
              };
              darwin = lib.mkOption {
                type = with lib.types; listOf str;
                defaultText = "[ <All Darwin Machines> ]";
                description = ''
                  !!! example "Predefined Tag"

                      Will be added to all machines that set `machineClass = "darwin"`

                      ```nix
                      inventory.machines.machineA.tags = [ "darwin" ];
                      ```
                '';
              };
            };
          }
        ];
      };
    };

    machines = lib.mkOption {
      description = ''
        Machines in the inventory.

        Each machine declared here can be referencd via its `attributeName` by the `inventory.service`s `roles`.
      '';
      default = { };
      type = types.lazyAttrsOf (
        types.submoduleWith ({
          modules = [
            (
              { name, ... }:
              {
                tags = builtins.attrNames (
                  # config.tags
                  lib.filterAttrs (_t: tagMembers: builtins.elem name tagMembers) config.tags
                );
              }
            )
            (
              { name, ... }:
              {
                options = {
                  inherit (metaOptionsWith name) name description icon;

                  machineClass = lib.mkOption {
                    default = "nixos";
                    type = types.enum [
                      "nixos"
                      "darwin"
                    ];
                    description = ''
                      The module system that should be used to construct the machine

                      Set this to `darwin` for macOS machines
                    '';
                  };

                  tags = lib.mkOption {
                    description = ''
                      List of tags for the machine.

                      The machine can be referenced by its tags in `inventory.services`

                      ???+ Example
                          ```nix
                          inventory.machines.machineA.tags = [ "tag1" "tag2" ];
                          ```

                          ```nix
                          services.borgbackup."instance_1".roles.client.tags = [ "tag1" ];
                          ```

                      !!! Note
                          Tags can be used to determine the membership of the machine in the services.
                          Without changing the service configuration, the machine can be added to a service by adding the correct tags to the machine.

                    '';
                    default = [ ];
                    apply = lib.unique;
                    type = types.listOf types.str;
                  };
                  deploy.targetHost = lib.mkOption {
                    description = "Configuration for the deployment of the machine";
                    default = null;
                    type = types.nullOr types.str;
                  };
                };
              }
            )
          ];
        })
      );
    };

    instances = lib.mkOption {
      # Keep as internal until all de-/serialization issues are resolved
      visible = false;
      internal = true;
      description = "Multi host service module instances";
      type = types.attrsOf (
        types.submodule {
          options = {
            # ModuleSpec
            module = lib.mkOption {
              type = types.submodule {
                options.input = lib.mkOption {
                  type = types.nullOr types.str;
                  default = null;
                  defaultText = "Name of the input. Default to 'null' which means the module is local";
                  description = ''
                    Name of the input. Default to 'null' which means the module is local
                  '';
                };
                options.name = lib.mkOption {
                  type = types.str;
                };
              };
            };
            roles = lib.mkOption {
              default = { };
              type = types.attrsOf (
                types.submodule {
                  options = {
                    # TODO: deduplicate
                    machines = lib.mkOption {
                      type = types.attrsOf (
                        types.submodule {
                          options.settings = lib.mkOption {
                            default = { };
                            # Dont transform the value with `types.deferredModule` here. We need to keep it json serializable
                            # TODO: We need a custom serializer for deferredModule
                            type = types.deferredModule;
                          };
                        }
                      );
                      default = { };
                    };
                    tags = lib.mkOption {
                      type = types.attrsOf (
                        types.submodule {
                          options.settings = lib.mkOption {
                            default = { };
                            type = types.deferredModule;
                          };
                        }
                      );
                      default = { };
                    };
                    settings = lib.mkOption {
                      default = { };
                      type = types.deferredModule;
                    };
                  };
                }
              );
            };
          };
        }
      );
      default = { };
      apply =
        v:
        if v == { } then
          v
        else
          lib.warn "Inventory.instances and related features are still under development. Please use with care." v;
    };

    services = lib.mkOption {
      description = ''
        Services of the inventory.

        - The first `<name>` is the moduleName. It must be a valid clanModule name.
        - The second `<name>` is an arbitrary instance name.

        ???+ Example
            ```nix
            #        ClanModule name. See the module documentation for the available modules.
            #        ↓          ↓ Instance name, can be anything, some services might use it as a unique identifier.
            services.borgbackup."instance_1" = {
              roles.client.machines = ["machineA"];
            };
            ```

        !!! Note
            Services MUST be added to machines via `roles` exclusively.
            See [`roles.<rolename>.machines`](#inventory.services.roles.machines) or [`roles.<rolename>.tags`](#inventory.services.roles.tags) for more information.
      '';
      default = { };
      type = types.attrsOf (
        types.attrsOf (
          types.submodule (
            # instance name
            { name, ... }:
            {
              options.enabled = lib.mkOption {
                type = lib.types.bool;
                default = true;
                description = ''
                  Enable or disable the complete service.

                  If the service is disabled, it will not be added to any machine.

                  !!! Note
                      This flag is primarily used to temporarily disable a service.
                      I.e. A 'backup service' without any 'server' might be incomplete and would cause failure if enabled.
                '';
              };
              options.meta = metaOptionsWith name;
              options.extraModules = extraModulesOption;
              options.config = moduleConfig // {
                description = ''
                  Configuration of the specific clanModule.

                  !!! Note
                      Configuration is passed to the nixos configuration scoped to the module.

                      ```nix
                        clan.<serviceName> = { ... # Config }
                      ```

                  ???+ Example

                      For `services.borgbackup` the config is the passed to the machine with the prefix of `clan.borgbackup`.
                      This means all config values are mapped to the `borgbackup` clanModule exclusively (`config.clan.borgbackup`).

                      ```nix
                      {
                        services.borgbackup."instance_1".config = {
                          destinations = [ ... ];
                          # See the 'borgbackup' module docs for all options
                        };
                      }
                      ```

                  !!! Note
                      The module author is responsible for supporting multiple instance configurations in different roles.
                      See each clanModule's documentation for more information.
                '';
              };
              options.machines = lib.mkOption {
                description = ''
                  Attribute set of machines specific config for the service.

                  Will be merged with other service configs, such as the role config and the global config.
                  For machine specific overrides use `mkForce` or other higher priority methods.

                  ???+ Example

                      ```{.nix hl_lines="4-7"}
                      services.borgbackup."instance_1" = {
                        roles.client.machines = ["machineA"];

                        machines.machineA.config = {
                          # Additional specific config for the machine
                          # This is merged with all other config places
                        };
                      };
                      ```
                '';
                default = { };
                type = types.attrsOf (
                  types.submodule {
                    options.extraModules = extraModulesOption;
                    options.config = moduleConfig // {
                      description = ''
                        Additional configuration of the specific machine.

                        See how [`service.<name>.<name>.config`](#inventory.services.config) works in general for further information.
                      '';
                    };
                  }
                );
              };
              options.roles = lib.mkOption {
                default = { };
                type = types.attrsOf (
                  types.submodule {
                    options.machines = lib.mkOption {
                      default = [ ];
                      type = types.listOf types.str;
                      example = [ "machineA" ];
                      description = ''
                        List of machines which are part of the role.

                        The machines are referenced by their `attributeName` in the `inventory.machines` attribute set.

                        Memberships are declared here to determine which machines are part of the service.

                        Alternatively, `tags` can be used to determine the membership, more dynamically.
                      '';
                    };
                    options.tags = lib.mkOption {
                      default = [ ];
                      apply = lib.unique;
                      type = types.listOf types.str;
                      description = ''
                        List of tags which are used to determine the membership of the role.

                        The tags are matched against the `inventory.machines.<machineName>.tags` attribute set.
                        If a machine has at least one tag of the role, it is part of the role.
                      '';
                    };
                    options.config = moduleConfig // {
                      description = ''
                        Additional configuration of the specific role.

                        See how [`service.<name>.<name>.config`](#inventory.services.config) works in general for further information.
                      '';
                    };
                    options.extraModules = extraModulesOption;
                  }
                );
              };
            }
          )
        )
      );
    };
  };
}
