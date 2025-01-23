{
  config,
  lib,
  pkgs,
  ...
}:
let
  inherit (lib) mkOption types;
  networkCfg = config.clan.zerotier.networking;
in
{
  options.clan.zerotier =
    let
      inherit (lib.types) listOf str;
    in
    {
      excludeHosts = mkOption {
        type = listOf str;
        default = [ config.clan.core.settings.machine.name ];
        description = "Hosts that should be excluded";
      };
      networkIps = lib.mkOption {
        type = listOf str;
        default = [ ];
        description = "Extra zerotier network Ips that should be accepted";
      };
      networkIds = mkOption {
        type = listOf str;
        default = [ ];
        description = "Extra zerotier network Ids that should be accepted";
      };
      viaInventory = mkOption {
        type = types.bool;
        default = true;
        internal = true;
        readOnly = true;
        visible = false;
      };
      networking = {
        networkId = lib.mkOption {
          type = types.str;
          description = ''
            zerotier networking id
          '';
        };
        name = lib.mkOption {
          type = lib.types.str;
          default = config.clan.core.settings.name;
          defaultText = "config.clan.core.name";
          description = ''
            zerotier network name
          '';
        };
        moon = {
          stableEndpoints = lib.mkOption {
            type = lib.types.listOf lib.types.str;
            default = [ ];
            description = ''
              Make this machine a moon.
              Other machines can join this moon by adding this moon in their config.
              It will be reachable under the given stable endpoints.
            '';
            example = ''
              [ 1.2.3.4" "10.0.0.3/9993" "2001:abcd:abcd::3/9993" ]
            '';
          };
          orbitMoons = lib.mkOption {
            type = lib.types.listOf lib.types.str;
            default = [ ];
            description = ''
              Join these moons.
              This machine will be able to reach all machines in these moons.
            '';
          };
        };
        subnet = lib.mkOption {
          type = lib.types.nullOr lib.types.str;
          readOnly = true;
          default =
            if networkCfg.networkId == null then
              null
            else
              let
                part0 = builtins.substring 0 2 networkCfg.networkId;
                part1 = builtins.substring 2 2 networkCfg.networkId;
                part2 = builtins.substring 4 2 networkCfg.networkId;
                part3 = builtins.substring 6 2 networkCfg.networkId;
                part4 = builtins.substring 8 2 networkCfg.networkId;
                part5 = builtins.substring 10 2 networkCfg.networkId;
                part6 = builtins.substring 12 2 networkCfg.networkId;
                part7 = builtins.substring 14 2 networkCfg.networkId;
              in
              "fd${part0}:${part1}${part2}:${part3}${part4}:${part5}${part6}:${part7}99:9300::/88";
          description = ''
            zerotier subnet
          '';
        };

        controller = {
          public = lib.mkOption {
            type = lib.types.bool;
            default = false;
            description = ''
              everyone can join a public network without having the administrator to accept
            '';
          };
        };
        settings = lib.mkOption {
          description = "override the network config in /var/lib/zerotier/bla/$network.json";
          type = lib.types.submodule { freeformType = (pkgs.formats.json { }).type; };
          default = { };
        };
      };
    };
}
