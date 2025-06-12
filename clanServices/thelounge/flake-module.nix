{ lib, self, ... }:
{
  clan.modules = {
    thelounge = lib.modules.importApply ./default.nix { };
  };
  perSystem =
    { pkgs, ... }:
    {
      checks = lib.optionalAttrs (pkgs.stdenv.isLinux) {
        thelounge = import ./tests/vm/default.nix {
          inherit pkgs;
          clan-core = self;
          nixosLib = import (self.inputs.nixpkgs + "/nixos/lib") { };
        };
      };
    };
}
