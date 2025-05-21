{ packages }:
{ lib, ... }:
{
  _class = "clan.service";
  manifest.name = "wifi";

  roles.default = {
    interface = {
      options.networks = lib.mkOption {
        visible = false;
        type = lib.types.attrsOf (
          lib.types.submodule (
            { ... }:
            {
              options = {
                enable = lib.mkOption {
                  type = lib.types.bool;
                  default = true;
                  description = "Enable this wifi network";
                };
                autoConnect = lib.mkOption {
                  type = lib.types.bool;
                  default = true;
                  description = "Automatically try to join this wifi network";
                };
              };
            }
          )
        );
        default = { };
        description = "Wifi networks to predefine";
      };

    };
    perInstance =
      { ... }:
      {
        nixosModule = ../../clanModules/wifi/roles/default.nix;
      };
  };

}
