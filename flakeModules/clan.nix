clan-core:
{
  config,
  lib,
  flake-parts-lib,
  self,
  inputs,
  ...
}:
let
  inherit (lib) types;

  buildClanModule = clan-core.clanLib.buildClanModule;
in
{

  options.clan = lib.mkOption {
    default = { };
    type = types.submoduleWith {
      specialArgs = {
        inherit clan-core self;
        inherit (inputs) nixpkgs;
      };
      modules = [
        buildClanModule.flakePartsModule
      ];
    };
  };

  options.flake = flake-parts-lib.mkSubmoduleOptions {
    clan = lib.mkOption { type = types.raw; };
    clanInternals = lib.mkOption { type = types.raw; };
  };
  config = {
    flake.clan = {
      inherit (config.clan.clanInternals) templates;
    };
    flake.clanInternals = config.clan.clanInternals;
    flake.nixosConfigurations = config.clan.nixosConfigurations;
  };
  _file = __curPos.file;
}
