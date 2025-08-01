{ _class, lib, ... }:
{
  imports =
    [
      ./backups.nix
      ./defaults.nix
      ./facts
      ./inventory
      ./meta/interface.nix
      ./metadata.nix
      ./networking.nix
      ./nix-settings.nix
      ./options.nix
      ./outputs.nix
      ./sops.nix
      ./vars
    ]
    ++ lib.optionals (_class == "nixos") [
      ./nixos-facter.nix
      ./vm.nix
      ./postgresql
      ./machine-id
      ./state-version
      ./wayland-proxy-virtwl.nix
      ./zerotier
      ./zfs.nix
    ];
}
