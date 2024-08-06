{
  lib,
  config,
  pkgs,
  ...
}:
let
  clanDir = config.clan.core.clanDir;
  machineDir = clanDir + "/machines/";
  machinesFileSet = builtins.readDir machineDir;
  machines = lib.mapAttrsToList (name: _: name) machinesFileSet;
  machineJson = builtins.toJSON machines;
  certificateMachinePath = machines: machineDir + "/${machines}" + "/facts/mumble-cert";
  certificatesUnchecked = builtins.map (
    machine:
    let
      fullPath = certificateMachinePath machine;
    in
    if builtins.pathExists fullPath then machine else null
  ) machines;
  certificate = lib.filter (machine: machine != null) certificatesUnchecked;
  machineCert = builtins.map (
    machine: (lib.nameValuePair machine (builtins.readFile (certificateMachinePath machine)))
  ) certificate;
  machineCertJson = builtins.toJSON machineCert;

in
{
  options.clan.services.mumble = {
    user = lib.mkOption {
      type = lib.types.string;
      default = "alice";
      description = "The user mumble should be set up for.";
    };
  };

  config = {
    services.murmur = {
      enable = true;
      logDays = -1;
      registerName = config.clan.core.machineName;
      openFirewall = true;
      bonjour = true;
      sslKey = config.clan.core.facts.services.mumble.secret.mumble-key.path;
      sslCert = config.clan.core.facts.services.mumble.public.mumble-cert.path;
    };

    clan.core.state.mumble.folders = [
      "/var/lib/mumble"
      "/var/lib/murmur"
    ];

    systemd.tmpfiles.rules = [
      "d '/var/lib/mumble' 0770 '${config.clan.services.mumble.user}' 'users' - -"
    ];

    environment.systemPackages =
      let
        mumbleCfgDir = "/var/lib/mumble";
        mumbleDatabasePath = "${mumbleCfgDir}/mumble.sqlite";
        mumbleCfgPath = "/var/lib/mumble/mumble_settings.json";
        populate-channels = pkgs.writers.writePython3 "mumble-populate-channels" {
          libraries = [
            pkgs.python3Packages.cryptography
            pkgs.python3Packages.pyopenssl
          ];
          flakeIgnore = [
            # We don't live in the dark ages anymore.
            # Languages like Python that are whitespace heavy will overrun
            # 79 characters..
            "E501"
          ];
        } (builtins.readFile ./mumble-populate-channels.py);
        mumble = pkgs.writeShellScriptBin "mumble" ''
          set -xeu
          mkdir -p ${mumbleCfgDir}
          pushd "${mumbleCfgDir}"
          XDG_DATA_HOME=${mumbleCfgDir}
          XDG_DATA_DIR=${mumbleCfgDir}
          ${populate-channels} --ensure-config '${mumbleCfgPath}' --db-location ${mumbleDatabasePath}
          echo ${machineCertJson}
          ${populate-channels} --machines '${machineJson}' --username ${config.clan.core.machineName} --db-location ${mumbleDatabasePath}
          ${populate-channels} --servers '${machineCertJson}' --username ${config.clan.core.machineName} --db-location ${mumbleDatabasePath} --cert True
          ${pkgs.mumble}/bin/mumble --config ${mumbleCfgPath} "$@"
          popd
        '';
      in
      [ mumble ];

    clan.core.facts.services.mumble = {
      secret.mumble-key = { };
      public.mumble-cert = { };
      generator.path = [
        pkgs.coreutils
        pkgs.openssl
      ];
      generator.script = ''
        openssl genrsa -out $secrets/mumble-key 2048
        openssl req -new -x509 -key $secrets/mumble-key -out $facts/mumble-cert
      '';
    };
  };

}
