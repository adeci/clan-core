{
  outputs =
    { ... }:
    let
      templates = {
        disko = {
          single-disk = {
            description = "BIOS & UEFI compatible (GRUB bootloader)";
            path = ./disk/single-disk;
          };
          uefi-basic = {
            description = "Basic UEFI setup with systemd-boot";
            path = ./disk/uefi-basic;
          };
          uefi-swap = {
            description = "UEFI with swap partition (systemd-boot)";
            path = ./disk/uefi-swap;
          };
          encrypted-basic = {
            description = "Full disk encryption with LUKS (systemd-boot)";
            path = ./disk/encrypted-basic;
          };
          btrfs-basic = {
            description = "Modern Btrfs filesystem with snapshots (systemd-boot)";
            path = ./disk/btrfs-basic;
          };
          bcachefs-basic = {
            description = "Modern Bcachefs filesystem with compression (systemd-boot)";
            path = ./disk/bcachefs-basic;
          };
        };

        machine = {
          flash-installer = {
            description = "Initialize a new flash-installer machine";
            path = ./machine/flash-installer;
          };

          new-machine = {
            description = "Initialize a new machine";
            path = ./machine/new-machine;
          };
        };

        clan = {
          default = {
            description = "Initialize a new clan flake";
            path = ./clan/default;
          };
          minimal = {
            description = "for clans managed via (G)UI";
            path = ./clan/minimal;
          };
          flake-parts = {
            description = "Flake-parts";
            path = ./clan/flake-parts;
          };
        };
      };
    in
    rec {
      inherit (clan) clanInternals;

      clan.clanInternals.templates = templates;
      clan.templates = templates;
    };
}
