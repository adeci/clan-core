{
  lib,
  ...
}:
let
  inherit (lib) mkOption types;
in
{
  options.clan.zerotier =
    let
      inherit (lib.types) listOf str;
    in
    {
      excludeHosts = mkOption {
        type = listOf str;
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
          default = null;
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
          # TODO:
          # Make pkgs.formats compatible with json schema converter
          # { freeformType = (pkgs.formats.json { }).type; };
          type = lib.types.submodule { freeformType = lib.types.attrsOf lib.types.anything; };
          default = { };
        };
      };
    };
}
