{ lib, ... }:
{
  _class = "clan.service";
  manifest.name = "wireguard";

  # Peer options and configuration
  roles.peer = {

    interface = {

      # TODO use
      options.prefixLength = lib.mkOption {
        type = lib.types.int;
        example = 56;
        default = 48;
        description = ''
          Length of the prefix
        '';
      };

      options.controller = lib.mkOption {
        type = lib.types.str;
        example = "contorller1";
        description = ''
          Machinename of the controller to attach to
        '';
      };

      options.extraIPs = lib.mkOption {
        type = lib.types.listOf lib.types.str;
        default = [ ];
        example = [ "192.168.2.0/24" ];
        description = ''
          IP address of the host.
        '';
      };
    };

    perInstance =
      {
        instanceName,
        settings,
        roles,
        ...
      }:
      {
        # Peers, know about one controller
        nixosModule =
          { config, ... }:
          let

            mkInterfaceName =
              instance: controller: builtins.substring 0 8 (builtins.hashString "sha256" (lib.traceVal "${instance}${controller}"));

            controllerName =
              if (builtins.length (builtins.attrNames roles.controller.machines) == 1) then
                (builtins.head roles.controller.machines)
              else
                settings.controller;

            # controller = roles.controller.machines."${controllerName}";
            #
            # controllerPeers =
            #   name:
            #   builtins.filter (
            #     p:
            #     # let
            #     #   peerController =
            #     #     if (builtins.length (builtins.attrNames roles.controller.machines) == 1) then
            #     #       (builtins.head roles.controller.machines)
            #     #     else
            #     #       roles.peer.machines."${p}".settings.controller;
            #     # in
            #     # (peerController == name && p != machine.name)
            #     (p != machine.name)
            #   ) (builtins.attrNames roles.peer.machines);

          in
          {

            # Add controllers to /etc/hosts
            networking.extraHosts = builtins.concatStringsSep "\n" (
              lib.mapAttrsToList (
                name: value:
                ''${
                  builtins.readFile (
                    config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                  )
                } ${name}.${instanceName} ''
              ) (roles.controller.machines // roles.peer.machines)
            );

            networking.wireguard.interfaces = lib.mapAttrs' (name: value: {

              name = mkInterfaceName instanceName name;

              value = {

                allowedIPsAsRoutes = (name == controllerName);

                ips = [
                  "${config.clan.core.vars.generators."wireguard-${instanceName}".files.ip.value}/128"
                ];

                privateKeyFile =
                  config.clan.core.vars.generators."wireguard-${instanceName}".files."privatekey".path;

                peers = [
                  {

                    # Public key of the controller
                    publicKey = (
                      builtins.readFile (
                        config.clan.core.settings.directory
                        + "/vars/per-machine/${name}/wireguard-${instanceName}/publickey/value"
                      )
                    );

                    allowedIPs = [ config.clan.core.vars.generators."wireguard-${instanceName}".files.prefix.value ];

                    # If it is a controller, we also set the endpoint
                    endpoint = "${value.settings.endpoint}:${toString value.settings.port}";
                    persistentKeepalive = 25;
                  }
                ];
              };
            }) roles.controller.machines;
          };
      };
  };

  # Controller options and configuration
  roles.controller = {
    interface = {
      options.endpoint = lib.mkOption {
        type = lib.types.str;
        example = "vpn.clan.lol";
        description = ''
          Endpoint where the contoller can be reached
        '';
      };

      options.port = lib.mkOption {
        type = lib.types.int;
        example = 51820;
        default = 51820;
        description = ''
          Port for the endpoint, where the contoller can be reached
        '';
      };

      options.extraIPs = lib.mkOption {
        type = lib.types.listOf lib.types.str;
        default = [ ];
        example = [ "192.168.2.0/24" ];
        description = ''
          IP address of the host.
        '';
      };

      # TODO use
      options.prefixLength = lib.mkOption {
        type = lib.types.int;
        example = 56;
        default = 48;
        description = ''
          Length of the prefix
        '';
      };

    };
    perInstance =
      {
        settings,
        instanceName,
        roles,
        machine,
        ...
      }:
      {

        # Controllers, know about all other machines (regardless of their role)
        nixosModule =
          { config, ... }:
          let

            allHosts = roles.peer.machines // roles.controller.machines;
            allOthers = lib.filterAttrs (name: v: name != machine.name) allHosts;
          in
          {
            # Enable ip forwarding, so wireguard peers can reach eachother
            # TODO bug?
            # boot.kernel.sysctl."net.ipv4.ip_forward" = 1;
            boot.kernel.sysctl."net.ipv6.conf.all.forwarding" = 1;

            networking.firewall.allowedUDPPorts = [ settings.port ];

            networking.extraHosts =

              builtins.concatStringsSep "\n" (

                lib.mapAttrsToList (
                  name: value:
                  ''${
                    builtins.readFile (
                      config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                    )
                  } ${name}.${instanceName} ''
                ) allHosts
              );

            networking.wireguard.interfaces."${instanceName}" = {

              listenPort = settings.port;

              ips = [
                "${config.clan.core.vars.generators."wireguard-${instanceName}".files.ip.value}/128"
              ];

              privateKeyFile =
                config.clan.core.vars.generators."wireguard-${instanceName}".files."privatekey".path;

              peers = lib.mapAttrsToList (name: value: {
                publicKey = (
                  builtins.readFile (
                    config.clan.core.settings.directory
                    + "/vars/per-machine/${name}/wireguard-${instanceName}/publickey/value"
                  )
                );

                allowedIPs = [
                  "${builtins.readFile (
                    config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                  )}"
                ] ++ value.settings.extraIPs;

                # If it is a controller, we also set the endpoint
                endpoint =
                  if builtins.elem name (builtins.attrNames roles.controller.machines) then
                    # if (builtins.elem "controller" value.roles) then
                    "${value.settings.endpoint}:${toString value.settings.port}"
                  else
                    null;

                persistentKeepalive = 25;

              }) allOthers;
            };
          };
      };
  };

  # Maps over all machines and produces one result per machine, regardless of role
  perMachine =
    { instances, machine, ... }:
    {
      nixosModule =
        { config, pkgs, ... }:
        {

          # Generate keys for each instance of the host
          clan.core.vars.generators = lib.mapAttrs' (
            name: _value:
            lib.nameValuePair ("wireguard-" + name) rec {
              files.publickey.secret = false;
              files.privatekey = { };

              files.ip.secret = false;
              files.prefix.secret = false;

              runtimeInputs = with pkgs; [
                wireguard-tools
                gawk
              ];

              # Invalidaten on network or hostname changes, as prefix and ip
              # are derived from these
              validation.script = script;
              validation.hostname = machine.name;
              validation.network = name;

              script = ''
                wg genkey > $out/privatekey
                wg pubkey < $out/privatekey > $out/publickey

                ${builtins.readFile ./ipv6gen.sh}

                # TODO Don't hardcode prefix length here
                ula_prefix=$(generate_ula_prefix "${name}" "48")
                echo -n $ula_prefix > $out/prefix
                generate_ipv6_address_from_prefix "$ula_prefix" ${machine.name} > $out/ip
              '';
            }
          ) instances;

        };
    };
}
