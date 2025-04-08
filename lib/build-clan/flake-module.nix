{
  self,
  inputs,
  ...
}:
let
  inputOverrides = builtins.concatStringsSep " " (
    builtins.map (input: " --override-input ${input} ${inputs.${input}}") (builtins.attrNames inputs)
  );
in
{
  perSystem =
    {
      pkgs,
      lib,
      system,
      ...
    }:
    let
      jsonDocs = import ./eval-docs.nix {
        inherit pkgs lib;
      };
    in
    {
      legacyPackages.clan-internals-docs = jsonDocs.optionsJSON;

      # Run: nix-unit --extra-experimental-features flakes --flake .#legacyPackages.x86_64-linux.evalTests-build-clan
      legacyPackages.evalTests-build-clan = import ./tests.nix {
        inherit lib;
        inherit (inputs) nixpkgs;
        clan-core = self;
        buildClan = self.lib.buildClan;
      };
      checks = {
        lib-build-clan-eval = pkgs.runCommand "tests" { nativeBuildInputs = [ pkgs.nix-unit ]; } ''
          export HOME="$(realpath .)"

          nix-unit --eval-store "$HOME" \
            --extra-experimental-features flakes \
            --show-trace \
            ${inputOverrides} \
            --flake ${
              self.filter {
                include = [
                  "flakeModules"
                  "inventory.json"
                  "lib"
                  "machines"
                  "nixosModules"
                ];
              }
            }#legacyPackages.${system}.evalTests-build-clan

          touch $out
        '';
      };
    };
}
