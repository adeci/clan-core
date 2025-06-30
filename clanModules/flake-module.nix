{ lib, ... }:
let
  inherit (lib)
    filterAttrs
    pathExists
    ;
in
{
  # only import available files, as this allows to filter the files for tests.
  flake.clanModules = filterAttrs (_name: pathExists) {
    auto-upgrade = ./auto-upgrade;
    admin = ./admin;
    borgbackup = ./borgbackup;
    borgbackup-static = ./borgbackup-static;
    deltachat = ./deltachat;
    data-mesher = ./data-mesher;
    disk-id = ./disk-id;
    dyndns = ./dyndns;
    ergochat = ./ergochat;
    garage = ./garage;
    heisenbridge = ./heisenbridge;
    importer = ./importer;
    iwd = ./iwd;
    localbackup = ./localbackup;
    localsend = ./localsend;
    matrix-synapse = ./matrix-synapse;
    moonlight = ./moonlight;
    mumble = ./mumble;
    mycelium = ./mycelium;
    nginx = ./nginx;
    packages = ./packages;
    postgresql = ./postgresql;
    root-password = ./root-password;
    single-disk = ./single-disk;
    sshd = ./sshd;
    static-hosts = ./static-hosts;
    sunshine = ./sunshine;
    syncthing = ./syncthing;
    syncthing-static-peers = ./syncthing-static-peers;
    thelounge = ./thelounge;
    trusted-nix-caches = ./trusted-nix-caches;
    user-password = ./user-password;
    vaultwarden = ./vaultwarden;
    wifi = ./wifi;
    xfce = ./xfce;
    zerotier = ./zerotier;
    zerotier-static-peers = ./zerotier-static-peers;
    zt-tcp-relay = ./zt-tcp-relay;
  };
}
