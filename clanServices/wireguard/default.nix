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

            modulo = number: mod: (number - ((number / mod) * mod));

            # Determine own index
            peers = builtins.sort (p: q: p < q) (builtins.attrNames roles.peer.machines);
            ownIndex = lib.lists.findFirstIndex (p: p == machine.name) null peers;

            # Sort controllers and choose one
            controllers = builtins.sort (p: q: p < q) (builtins.attrNames roles.controller.machines);
            numControllers = builtins.length controllers;
            controllerName = builtins.elemAt controllers (modulo ownIndex numControllers);
            controller = roles.controller.machines."${controllerName}";

          in
          {
            networking.wireguard.interfaces."${instanceName}".peers = [
              {
                # Public key of the server
                publicKey = (
                  builtins.readFile (
                    config.clan.core.settings.directory
                    + "/vars/per-machine/${controllerName}/wireguard-${instanceName}/publickey/value"
                  )
                );

                # Full subnet of the server
                allowedIPs = [
                  "${builtins.readFile (
                    config.clan.core.settings.directory
                    + "/vars/per-machine/${controllerName}/wireguard-${instanceName}/prefix/value"
                  )}"
                ];

                endpoint = "${controller.settings.endpoint}:${toString controller.settings.port}";
                persistentKeepalive = 25;
              }
            ];
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
            allOthers = lib.filterAttrs (name: v: name != machine.name) (
              roles.peer.machines // roles.controller.machines
            );
          in
          {
            # Enable ip forwarding, so wireguard peers can reach eachother
            # TODO bug?
            # boot.kernel.sysctl."net.ipv4.ip_forward" = 1;

            networking.wireguard.interfaces."${instanceName}" = {

              listenPort = settings.port;

              peers = lib.mapAttrsToList (name: value: {
                publicKey = (
                  builtins.readFile (
                    config.clan.core.settings.directory
                    + "/vars/per-machine/${name}/wireguard-${instanceName}/publickey/value"
                  )
                );

                allowedIPs = [
                  # TODO do we need a subnet here?
                  "${builtins.readFile (
                    config.clan.core.settings.directory + "/vars/per-machine/${name}/wireguard-${instanceName}/ip/value"
                  )}"
                ] ++ value.settings.extraIPs;

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
            name: value:
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

              script =

                ''
                  wg genkey > $out/privatekey
                  wg pubkey < $out/privatekey > $out/publickey

                  ${builtins.readFile ./ipv6gen.sh}

                  # TODO Don't hardcode prefix length here
                  ula_prefix=$(generate_ula_prefix "${name}" "48")
                  echo $ula_prefix > $out/prefix
                  generate_ipv6_address_from_prefix "$ula_prefix" ${machine.name} > $out/ip
                '';
            }
          ) instances;

          # Set the private key for each instance
          networking.wireguard.interfaces = builtins.mapAttrs (name: _: {
            privateKeyFile = "${config.clan.core.vars.generators."wireguard-${name}".files."privatekey".path}";

            ips = [
              "${
                builtins.readFile (
                  config.clan.core.settings.directory + "/vars/per-machine/${machine.name}/wireguard-${name}/ip/value"
                )
              }/48"
            ];

          }) instances;
        };
    };
}
