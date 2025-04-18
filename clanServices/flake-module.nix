{ self, lib, ... }:
{
  imports = [
    ./hello-world/flake-module.nix
  ];
  clan.inventory.modules = {
    wireguard = lib.modules.importApply ./wireguard/default.nix {
      inherit (self) packages;
    };
  };
}
