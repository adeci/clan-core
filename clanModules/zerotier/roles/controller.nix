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

  networkCfg = config.clan.zerotier.networking;
in
{
  imports = [
    ../shared.nix
  ];
  config = {
    environment.systemPackages = [ config.clan.core.clanPkgs.zerotier-members ];
    # Runs on controller
    systemd.services.zerotierone.serviceConfig.ExecStartPost = [
      "+${pkgs.writeShellScript "whitelist-controller" ''
        ${config.clan.core.clanPkgs.zerotier-members}/bin/zerotier-members allow ${
          builtins.substring 0 10 networkCfg.networkId
        }
      ''}"
    ];

    systemd.services.zerotier-inventory-autoaccept =
      let
        machines = uniqueStrings (roles.moon.machines ++ roles.controller.machines ++ roles.peer.machines);
        networkIps = builtins.foldl' (
          ips: name:
          let
            ipPath = "${config.clan.core.settings.directory}/vars/per-machine/${name}/zerotier-peer/zerotier-ip/value";
          in
          if builtins.pathExists ipPath then
            ips
            ++ [
              (builtins.readFile ipPath)
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
          ${lib.concatMapStringsSep "\n" (host: ''
            ${config.clan.core.clanPkgs.zerotier-members}/bin/zerotier-members allow ${host}
          '') config.clan.zerotier.networkIds}
        '';
      };

    clan.core.state.zerotier.folders = [ "/var/lib/zerotier-one" ];

    clan.zerotier.networking.settings = {
      authTokens = [ null ];
      authorizationEndpoint = "";
      capabilities = [ ];
      clientId = "";
      dns = { };
      enableBroadcast = true;
      id = networkCfg.networkId;
      ipAssignmentPools = [ ];
      mtu = 2800;
      multicastLimit = 32;
      name = networkCfg.name;
      uwid = networkCfg.networkId;
      objtype = "network";
      private = !networkCfg.controller.public;
      remoteTraceLevel = 0;
      remoteTraceTarget = null;
      revision = 1;
      routes = [ ];
      rules = [
        {
          not = false;
          "or" = false;
          type = "ACTION_ACCEPT";
        }
      ];
      rulesSource = "";
      ssoEnabled = false;
      tags = [ ];
      v4AssignMode = {
        zt = false;
      };
      v6AssignMode = {
        "6plane" = false;
        rfc4193 = true;
        zt = false;
      };
    };

  };
}
