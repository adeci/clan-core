{
  config,
  lib,
  pkgs,
  ...
}:
let
  instanceNames = builtins.attrNames config.clan.inventory.services.zerotier;
  instanceName = builtins.head instanceNames;
  zeroTierInstance = config.clan.inventory.services.zerotier.${instanceName};
  roles = zeroTierInstance.roles;
  # TODO(@mic92): This should be upstreamed to nixpkgs
  uniqueStrings = list: builtins.attrNames (builtins.groupBy lib.id list);
in
{
  imports = [
    ../shared.nix
  ];
  config = {
    systemd.services.zerotier-inventory-autoaccept =
      let
        machines = uniqueStrings (roles.moon.machines ++ roles.controller.machines ++ roles.peer.machines);
        networkIps = builtins.foldl' (
          ips: name:
          if
            builtins.pathExists "${config.clan.core.settings.directory}/vars/per-machine/${name}/zerotier/zerotier-ip/value"
          then
            ips
            ++ [
              (builtins.readFile "${config.clan.core.settings.directory}/vars/per-machine/${name}/zerotier/zerotier-ip/value")
            ]
          else
            ips
        ) [ ] machines;
        allHostIPs = config.clan.zerotier.networkIps ++ networkIps;
      in
      {
        wantedBy = [ "multi-user.target" ];
        after = [ "zerotierone.service" ];
        path = [ config.clan.core.clanPkgs.zerotierone ];
        serviceConfig.ExecStart = pkgs.writeShellScript "zerotier-inventory-autoaccept" ''
          ${lib.concatMapStringsSep "\n" (host: ''
            ${config.clan.core.clanPkgs.zerotier-members}/bin/zerotier-members allow --member-ip ${host}
          '') allHostIPs}
        '';
      };

    clan.core.networking.zerotier.controller.enable = lib.mkDefault true;
  };
}
