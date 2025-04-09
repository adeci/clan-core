{ packages }: { ... }:
{
  _class = "clan.service";
  manifest.name = "@clan-core/zerotier";

  roles.moon = {
    interface =
      { lib, ... }:
      {
        options = {
          stableEndpoints = lib.mkOption {
            type = lib.types.nonEmptyListOf lib.types.str;
            default = [ ];
            description = ''
              List of publicly reachable IP addresses.
              Peers will use these IP addresses trying to use the moon for relaying traffic.
            '';
          };
        };
      };
    perInstance =
      { settings, ... }:
      {
        nixosModule =
          {
            lib,
            pkgs,
            ...
          }:
          let
            genMoonScript =
              pkgs.runCommand "genmoon"
                {
                  nativeBuildInputs = [ pkgs.python3 ];
                  meta.mainProgram = "genmoon";
                }
                ''
                  install -Dm755 ${./genmoon.py} $out/bin/genmoon
                  patchShebangs $out/bin/genmoon
                '';
          in
          {
            systemd.services.zerotierone.serviceConfig.ExecStartPre = lib.mkAfter [
              "+${pkgs.writeShellScript "configure-moon" ''
                if [[ ! -f /var/lib/zerotier-one/moon.json ]]; then
                  zerotier-idtool initmoon /var/lib/zerotier-one/identity.public > /var/lib/zerotier-one/moon.json
                fi
                ${lib.getExe genMoonScript} /var/lib/zerotier-one/moon.json ${builtins.toFile "moon.json" (builtins.toJSON settings.stableEndpoints)} /var/lib/zerotier-one/moons.d
              ''}"
            ];
          };
      };
  };

  # Affects everyone
  roles.peer = {
    perInstance =
      {
        roles,
        machine,
        settings,
        ...
      }:
      {
        nixosModule =
          {
            lib,
            config,
            pkgs,
            ...
          }:
          let
            facts = config.clan.core.facts.services.zerotier.public;

            moons = lib.attrNames (roles.moon.machines or { });
            moonIps = builtins.foldl' (
              ips: name:
              if
                builtins.pathExists "${config.clan.core.settings.directory}/machines/${name}/facts/zerotier-ip"
              then
                ips
                ++ [
                  (builtins.readFile "${config.clan.core.settings.directory}/machines/${name}/facts/zerotier-ip")
                ]
              else
                ips
            ) [ ] moons;
          in
          {
            services.zerotierone.joinNetworks = [ facts.zerotier-network-id.value ];

            systemd.services.zerotierone.serviceConfig.ExecStartPost = [
              "+${pkgs.writeShellScript "configure-interface" ''
                while ! ${pkgs.netcat}/bin/nc -z localhost 9993; do
                  sleep 0.1
                done
                zerotier-cli listnetworks -j | ${pkgs.jq}/bin/jq -r '.[] | [.portDeviceName, .name] | @tsv' \
                  | while IFS=$'\t' read -r portDeviceName name; do
                    if [[ -z "$name" ]] || [[ -z "$portDeviceName" ]]; then
                      continue
                    fi
                    # Execute the command for each element
                    ${pkgs.iproute2}/bin/ip link property add dev "$portDeviceName" altname "$name"
                done
              ''}"

              # TODO: replace this script with storing the node_id of our moons in vars and just running `zerotier-cli orbit <node_id> <node_id>`
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
            ];

            imports = [
              {
                options.debug = lib.mkOption {
                  default = moonIps;
                };
              }
              # TODO: the network ID should always be non-null so we can remove it post-vars
              (lib.mkIf ((config.clan.core.facts.services.zerotier.public.zerotier-ip.value or null) != null) {
                environment.etc."zerotier/ip".text =
                  config.clan.core.facts.services.zerotier.public.zerotier-ip.value;
              })

              # Only applies if we're a non-controller peer
              # TODO: the network ID should always be non-null so we can remove it post-vars
              (lib.mkIf
                (
                  !roles.controller.machines ? ${machine.name}
                  && (config.clan.core.facts.services.zerotier.public.zerotier-network-id.value or null) != null
                )
                {
                  clan.core.facts.services.zerotier = {
                    public.zerotier-ip = { };
                    secret.zerotier-identity-secret = { };
                    generator.path = [
                      config.services.zerotierone.package
                      pkgs.python3
                    ];
                    generator.script = ''
                      python3 ${./generate.py} --mode identity \
                        --ip "$facts/zerotier-ip" \
                        --identity-secret "$secrets/zerotier-identity-secret" \
                        --network-id ${config.clan.core.facts.services.zerotier.public.zerotier-network-id.value}
                    '';
                  };
                }
              )
            ];
          };
      };
  };

  # Only affects the controller
  roles.controller = {
    interface =
      { lib, ... }:
      let
        inherit (lib) types mkOption;
      in
      {
        options = {
          network.public = mkOption {
            type = types.bool;
            default = false;
            description = ''
              everyone can join a public network without having the administrator to accept
            '';
          };
          network.settings = mkOption {
            # TODO: Add types.json to upstream nixpkgs.lib so we don't have to import nixpkgs. NO need to add dependencies on 'pkgs' and/or 'system' here.
            # type = types.submodule { freeformType = (pkgs.formats.json { }).type; };
            description = "override the network config in /var/lib/zerotier-one/controller.d/network/{networkId}.json";
            default = { };
          };
        };
      };

    perInstance =
      {
        instanceName,
        extendSettings,
        ...
      }:
      {
        nixosModule =
          {
            pkgs,
            config,
            lib,
            ...
          }:
          let
            finalSettings = extendSettings (self: {
              network.settings = {
                authTokens = [ null ];
                authorizationEndpoint = "";
                capabilities = [ ];
                clientId = "";
                dns = { };
                enableBroadcast = true;
                id = facts.zerotier-network-id.value;
                ipAssignmentPools = [ ];
                mtu = 2800;
                multicastLimit = 32;
                name = instanceName;
                uwid = facts.zerotier-network-id.value;
                objtype = "network";
                private = !self.config.network.public;
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
            });
            facts = config.clan.core.facts.services.zerotier.public;
            networkId = facts.zerotier-network-id.value;
          in
          {
            #
            systemd.services.zerotierone.serviceConfig.ExecStartPre = lib.mkBefore [
              "+${pkgs.writeShellScript "init-zerotier" ''
                mkdir -p /var/lib/zerotier-one/controller.d/network
                ln -sfT ${pkgs.writeText "net.json" (builtins.toJSON finalSettings.network.settings)} /var/lib/zerotier-one/controller.d/network/${networkId}.json
              ''}"
            ];

            # only the controller needs to have the key in the repo, the other clients can be dynamic
            # we generate the zerotier code manually for the controller, since it's part of the bootstrap command
            clan.core.facts.services.zerotier = {
              public.zerotier-ip = {
                # value = "sha-256:ip";
              };
              public.zerotier-network-id = {
                # value = "sha-256:network";
              };
              secret.zerotier-identity-secret = {
                # value = "sha-256:secret";
              };
              generator.path = [
                config.services.zerotierone.package
                pkgs.python3
              ];
              generator.script = ''
                source ${(packages.${pkgs.system}.minifakeroot)}/share/minifakeroot/rc
                python3 ${./generate.py} --mode network \
                  --ip "$facts/zerotier-ip" \
                  --identity-secret "$secrets/zerotier-identity-secret" \
                  --network-id "$facts/zerotier-network-id"
              '';
            };

            environment.etc."zerotier/network-id".text = facts.zerotier-network-id.value;

            systemd.services.zerotierone.serviceConfig.ExecStartPost = [
              # Allow the controller to manage the network
              # This means allowing the controller to join the network.
              "+${pkgs.writeShellScript "whitelist-controller" ''
                ${config.clan.core.clanPkgs.zerotier-members}/bin/zerotier-members allow ${
                  # We're guessing that the first 10 characters of the Zerotier Network ID is
                  # the member ID of the controller
                  builtins.substring 0 10 facts.zerotier-network-id.value
                }
              ''}"
            ];
          };
      };
  };

  perMachine =
    { instances, machine, ... }:
    {
      nixosModule =
        {
          config,
          lib,
          pkgs,
          ...
        }:
        let
          instanceNames = builtins.attrNames instances;
          facts = config.clan.core.facts.services.zerotier.public or { };
        in
        {
          imports = [
            (
              {
                lib,
                config,
                ...
              }:
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
                _file = "this thing";
                config = {

                };
              }
            )

            #
            (lib.mkIf (facts.zerotier-network-id.value != null) {
              systemd.network.networks."09-zerotier" = {
                matchConfig.Name = "zt*";
                networkConfig = {
                  LLDP = true;
                  MulticastDNS = true;
                  KeepConfiguration = "static";
                };
              };

              systemd.services.zerotierone.serviceConfig.ExecStartPre = [
                "+${pkgs.writeShellScript "init-zerotier" ''
                  # compare hashes of the current identity secret and the one in the config
                  hash1=$(sha256sum /var/lib/zerotier-one/identity.secret | cut -d ' ' -f 1)
                  hash2=$(sha256sum ${config.clan.core.facts.services.zerotier.secret.zerotier-identity-secret.path} | cut -d ' ' -f 1)
                  if [[ "$hash1" != "$hash2" ]]; then
                    echo "Identity secret has changed, backing up old identity to /var/lib/zerotier-one/identity.secret.bac"
                    cp /var/lib/zerotier-one/identity.secret /var/lib/zerotier-one/identity.secret.bac
                    cp /var/lib/zerotier-one/identity.public /var/lib/zerotier-one/identity.public.bac
                    cp ${config.clan.core.facts.services.zerotier.secret.zerotier-identity-secret.path} /var/lib/zerotier-one/identity.secret
                    zerotier-idtool getpublic /var/lib/zerotier-one/identity.secret > /var/lib/zerotier-one/identity.public
                  fi

                  # cleanup old networks
                  if [[ -d /var/lib/zerotier-one/networks.d ]]; then
                    find /var/lib/zerotier-one/networks.d \
                      -type f \
                      -name "*.conf" \
                      -not \( ${
                        lib.concatMapStringsSep " -o " (
                          netId: ''-name "${netId}.conf"''
                        ) config.services.zerotierone.joinNetworks
                      } \) \
                      -delete
                  fi
                ''}"
              ];

              networking.networkmanager.unmanaged = [ "interface-name:zt*" ];

              services.zerotierone.enable = true;

              # The official zerotier tcp relay no longer works: https://github.com/zerotier/ZeroTierOne/issues/2202
              # So we host our own relay in https://git.clan.lol/clan/clan-infra
              services.zerotierone.localConf.settings.tcpFallbackRelay = "65.21.12.51/4443";
            })
          ];

          # TODO: remove this entirely and don't depend on it from 'syncthing' ! or other services.
          options.clan.core.networking.zerotier = {
            # Not a setting
            # Derived from the networkId
            subnet = lib.mkOption {
              type = lib.types.nullOr lib.types.str;
              readOnly = true;
              default =
                if facts.zerotier-network-id.value == null then
                  null
                else
                  let
                    part0 = builtins.substring 0 2 facts.zerotier-network-id.value;
                    part1 = builtins.substring 2 2 facts.zerotier-network-id.value;
                    part2 = builtins.substring 4 2 facts.zerotier-network-id.value;
                    part3 = builtins.substring 6 2 facts.zerotier-network-id.value;
                    part4 = builtins.substring 8 2 facts.zerotier-network-id.value;
                    part5 = builtins.substring 10 2 facts.zerotier-network-id.value;
                    part6 = builtins.substring 12 2 facts.zerotier-network-id.value;
                    part7 = builtins.substring 14 2 facts.zerotier-network-id.value;
                  in
                  "fd${part0}:${part1}${part2}:${part3}${part4}:${part5}${part6}:${part7}99:9300::/88";
              description = ''
                zerotier subnet
              '';
            };
          };

          config = {
            clan.core.vars.generators.zerotier = {
              files.foo = {
                secret = false;
              };
              script = ''
                echo hello > $out/foo
              '';
            };

            clan.core.state.zerotier.folders = lib.mkIf (builtins.elem "controller" machine.roles) [
              "/var/lib/zerotier-one"
            ];
            environment.systemPackages = lib.mkIf (builtins.elem "controller" machine.roles) [
              config.clan.core.clanPkgs.zerotier-members
            ];

            # TODO: Maybe don't use our zerotierone and people should set `allowUnfree`?
            services.zerotierone.package = lib.mkDefault (packages.${pkgs.system}.zerotierone);

            networking.firewall.allowedTCPPorts = [ 9993 ];
            networking.firewall.allowedUDPPorts = [ 9993 ];

            # TODO: Remove this assertion once we support more than one instance
            assertions =
              [
                {
                  assertion = builtins.length instanceNames == 1;
                  message = "The zerotier module currently only supports one instance per machine, but found ${builtins.toString instanceNames} on machine ${config.clan.core.settings.machine.name}";
                }
              ]
              # TODO: remove this assertion once we start verifying constraints again
              ++ (lib.mapAttrsToList (_instanceName: instance: {
                assertion = builtins.length (lib.attrNames instance.roles.controller.machines) == 1;
                message = "ZeroTier only supports one controller per network";
              }) instances);
          };
        };
    };
}
