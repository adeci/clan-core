{ lib, ... }:
let
  module = lib.modules.importApply ./default.nix { };
in
{
  clan.modules.user-assignments = module;
}
