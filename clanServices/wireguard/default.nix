/*
  There are two roles: peers and controllers:
    - Every controller has an endpoint set
    - There can be multiple peers
    - There has to be one or more controllers
    - If multiple controllers exist, every peer has to set "their" chosen controller
    - Controllers have forwarding enabled, every peer and controller can reach
      everyone else, via extra controller hops if necessary

    Example:
              ┌───────────────────────────────┐
              │            ◄─────────────     │
              │ controller2              controller1
              │    ▲       ─────────────►    ▲     ▲
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ │                 │ │   │ │
              │    │ │ │ └───────────────┐ │ │   │ │
              │    │ │ └──────────────┐  │ │ │   │ │
              │      ▼                │  ▼ ▼     ▼
              └─► peer2               │  peer1  peer3
                                      │          ▲
                                      └──────────┘

  Peers: Get one iterface per controller, they have one "chosen" controller:
    - for chosen controller:
         - allowedIPsAsRoutes = true
         - allowedIPs = ?????
    - for each other controller:
         - allowedIPsAsRoutes = false
         - allowedIPs = ?????
  Controllers: Get TWO interfaces:
    - One connected to all other controllers
         - allowedIPs: the other corntroller's /128 ip
    - One connected to all peers
         - allowedIPs: the peer's /128 ip
*/

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

      options.port-peers = lib.mkOption {
        type = lib.types.int;
        example = 51820;
        default = 51820;
        description = ''
          Port for the controller intrerface and endpoint
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
            # TODO use. Not using during development for ease of debugging
            mkInterfaceName =
              instance: controller:
              builtins.substring 0 8 (builtins.hashString "sha256" "${instance}${controller}");

            controllerName =
              if (builtins.length (builtins.attrNames roles.controller.machines) == 1) then
                (builtins.head roles.controller.machines)
              else
                settings.controller;
          in
          {

            # Add all machines to /etc/hosts
            networking.extraHosts = builtins.concatStringsSep "\n" (
              lib.mapAttrsToList (
                name: _value:
                ''${
                  builtins.readFile (
                    config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                  )
                } ${name}.${instanceName} ''
              ) (roles.controller.machines // roles.peer.machines)
            );

            networking.firewall.allowedUDPPorts = [ settings.port-peers ];

            networking.wireguard.interfaces = lib.mapAttrs' (name: value: {
              name = mkInterfaceName instanceName name;
              value = {

                # Routes of the own controller win over the routes of the other
                metric = if name == controllerName then 700 else 800;

                ips = [
                  "${config.clan.core.vars.generators."wireguard-${instanceName}".files.ip.value}/128"
                ];

                privateKeyFile =
                  config.clan.core.vars.generators."wireguard-${instanceName}".files."privatekey".path;

                peers = [
                  {
                    publicKey = (
                      builtins.readFile (
                        config.clan.core.settings.directory
                        + "/vars/per-machine/${name}/wireguard-${instanceName}/publickey/value"
                      )
                    );

                    allowedIPs = [
                      config.clan.core.vars.generators."wireguard-${instanceName}".files.prefix.value
                      (builtins.readFile (
                        config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                      ))
                    ];

                    endpoint = "${roles.controller.machines."${name}".settings.endpoint}:${
                      toString roles.controller.machines."${name}".settings.port-peers
                    }";

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

      options.port-peers = lib.mkOption {
        type = lib.types.int;
        example = 51820;
        default = 51820;
        description = ''
          Port for the controller intrerface and endpoint
        '';
      };

      options.port-controllers = lib.mkOption {
        type = lib.types.int;
        example = 51821;
        default = 51821;
        description = ''
          Port for the peer interface
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
            allOtherControllers = lib.filterAttrs (name: _v: name != machine.name) roles.controller.machines;

            controllerPeersIps =
              controllerName:
              lib.mapAttrsToList (
                name: _value:
                "${builtins.readFile (
                  config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                )}"
              ) (lib.filterAttrs (_n: v: v.settings.controller == controllerName) roles.peer.machines);

          in
          {
            # Enable ip forwarding, so wireguard peers can reach eachother
            # TODO bug?
            # boot.kernel.sysctl."net.ipv4.ip_forward" = 1;
            boot.kernel.sysctl."net.ipv6.conf.all.forwarding" = 1;

            networking.firewall.allowedUDPPorts = [
              settings.port-peers
              settings.port-controllers
            ];

            networking.extraHosts =

              builtins.concatStringsSep "\n" (

                lib.mapAttrsToList (
                  name: _value:
                  ''${
                    builtins.readFile (
                      config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                    )
                  } ${name}.${instanceName} ''
                ) allHosts
              );

            # Interface to other controllers
            # TODO use hashed interface name
            networking.wireguard.interfaces."${instanceName}-p" = {

              listenPort = settings.port-peers;

              ips = [ "${config.clan.core.vars.generators."wireguard-${instanceName}".files.ip.value}/128" ];

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
                  (builtins.readFile (
                    config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                  ))
                ] ++ value.settings.extraIPs;

                persistentKeepalive = 25;

              }) (roles.peer.machines);
            };

            systemd.network.networks = lib.mapAttrs' (name: value: {
              name = "${instanceName}-c";
              value = {
                routes = [
                  {
                    Destination = builtins.readFile (
                      config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                    );
                  }
                ];
              };
            }) allOtherControllers;

            # Interface to peers
            # TODO use hashed interface name
            networking.wireguard.interfaces."${instanceName}-c" = {

              listenPort = settings.port-controllers;
              allowedIPsAsRoutes = false;

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

                # TODO add the ip's of this controller's peers here aswell
                allowedIPs =
                  [
                    (builtins.readFile (
                      config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                    ))
                  ]
                  ++ (controllerPeersIps name)
                  ++ value.settings.extraIPs;

                endpoint = "${value.settings.endpoint}:${toString value.settings.port-controllers}";
                persistentKeepalive = 25;

              }) allOtherControllers;
            };
          };
      };
  };

  # Maps over all machines and produces one result per machine, regardless of role
  perMachine =
    { instances, machine, ... }:
    {
      nixosModule =
        { pkgs, ... }:
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
