{ config, lib, ... }:
{
  imports = [
    ../shared.nix
  ];
  options.clan.zerotier.moon.stableEndpoints = lib.mkOption {
    type = lib.types.listOf lib.types.str;
    description = ''
      Make this machine a moon.
      Other machines can join this moon by adding this moon in their config.
      It will be reachable under the given stable endpoints.
    '';
    example = ''
      [ 1.2.3.4" "10.0.0.3/9993" "2001:abcd:abcd::3/9993" ]
    '';
  };
  config.clan.zerotier.networking.moon.stableEndpoints = config.clan.zerotier.moon.stableEndpoints;
}
