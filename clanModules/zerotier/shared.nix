{
  lib,
  config,
  pkgs,
  ...
}:
let
  instanceNames = builtins.attrNames config.clan.inventory.services.zerotier;
  instanceName = builtins.head instanceNames;
  zeroTierInstance = config.clan.inventory.services.zerotier.${instanceName};
  roles = zeroTierInstance.roles;
  controllerMachine = builtins.head roles.controller.machines;
  networkIdPath = "${config.clan.core.settings.directory}/vars/per-machine/${controllerMachine}/zerotier/zerotier-network-id/value";
  networkId =
    if builtins.pathExists networkIdPath then
      builtins.readFile networkIdPath
    else
      builtins.throw ''
        No zerotier network id found for ${controllerMachine}.
        Please run `clan vars generate ${controllerMachine}` first.
      '';
  moons = roles.moon.machines;
  moonIps = builtins.foldl' (
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
  ) [ ] moons;
in
{
  options.clan.zerotier =
    let
      inherit (lib.types) listOf str;
    in
    {
      excludeHosts = lib.mkOption {
        type = listOf str;
        default = [ config.clan.core.settings.machine.name ];
        defaultText = lib.literalExpression "[ config.clan.core.settings.machine.name ]";
        description = "Hosts that should be excluded";
      };
      networkIps = lib.mkOption {
        type = listOf str;
        default = [ ];
        description = "Extra zerotier network Ips that should be accepted";
      };
      networkIds = lib.mkOption {
        type = listOf str;
        default = [ ];
        description = "Extra zerotier network Ids that should be accepted";
      };
    };

  config = {
    assertions = [
      # TODO: This should also be checked via frontmatter constraints
      {
        assertion = builtins.length instanceNames == 1;
        message = "The zerotier module currently only supports one instance per machine, but found ${builtins.toString instanceNames} on machine ${config.clan.core.settings.machine.name}";
      }
    ];

    clan.core.networking.zerotier.networkId = networkId;
    clan.core.networking.zerotier.name = instanceName;

    # TODO: in future we want to have the node id of our moons in our vars
    systemd.services.zerotierone.serviceConfig.ExecStartPost = lib.mkIf (moonIps != [ ]) (
      lib.mkAfter [
        "+${pkgs.writeScript "orbit-moons-by-ip" ''
          #!${pkgs.python3.interpreter}
          import json
          import ipaddress
          import subprocess

          def compute_member_id(ipv6_addr: str) -> str:
              addr = ipaddress.IPv6Address(ipv6_addr)
              addr_bytes = bytearray(addr.packed)

              # Extract the bytes corresponding to the member_id (node_id)
              node_id_bytes = addr_bytes[10:16]
              node_id = int.from_bytes(node_id_bytes, byteorder="big")

              member_id = format(node_id, "x").zfill(10)[-10:]

              return member_id
          def main() -> None:
              ips = json.loads(${builtins.toJSON (builtins.toJSON moonIps)})
              for ip in ips:
                  member_id = compute_member_id(ip)
                  res = subprocess.run(["zerotier-cli", "orbit", member_id, member_id])
                  if res.returncode != 0:
                      print(f"Failed to add {member_id} to orbit")
          if __name__ == "__main__":
              main()
        ''}"
      ]
    );

  };
}
