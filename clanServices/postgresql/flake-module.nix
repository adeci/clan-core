{ lib, self, ... }:
{
  clan.modules = {
    postgresql = lib.modules.importApply ./default.nix { };
  };

  perSystem =
    { pkgs, ... }:
    {
      checks = lib.optionalAttrs (pkgs.stdenv.isLinux) {
        postgresql = import ./tests/vm/default.nix {
          inherit pkgs;
          clan-core = self;
          nixosLib = import (self.inputs.nixpkgs + "/nixos/lib") { };
        };
      };
    };
}
