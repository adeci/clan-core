{
  lib ? import <nixpkgs/lib>,
  pkgs ? import <nixpkgs> { },
}:
let
  inherit (import ../funcs.nix { inherit lib; }) readDirNames listVars;

  noVars = pkgs.runCommand "empty-dir" { } ''
    mkdir $out
  '';

  emtpyVars = pkgs.runCommand "empty-dir" { } ''
    mkdir -p $out/vars
  '';

in
{
  test_readDirNames = {
    expr = readDirNames ./populated/vars;
    expected = [ "my_machine" ];
  };

  test_listSecrets = {
    expr = listVars ./populated/vars;
    expected = [
      {
        machine = "my_machine";
        generator = "my_generator";
        name = "my_secret";
      }
    ];
  };

  test_listSecrets_no_vars = {
    expr = listVars noVars;
    expected = [ ];
  };

  test_listSecrets_empty_vars = {
    expr = listVars emtpyVars;
    expected = [ ];
  };
}
