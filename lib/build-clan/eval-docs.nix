{ pkgs, lib }:
let
  eval = lib.evalModules {
    modules = [
      ./interface.nix
    ];
  };
  evalDocs = pkgs.nixosOptionsDoc {
    options = eval.options;
    warningsAreErrors = true;
  };
in
{
  inherit (evalDocs) optionsJSON optionsNix;
  inherit eval;
}
