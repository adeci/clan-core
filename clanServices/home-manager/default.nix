{ ... }:
{
  _class = "clan.service";

  manifest = {
    name = "clan-core/home-manager";
    description = "Home Manager integration service";
    categories = [ "System" ];
    readme = builtins.readFile ./README.md;
  };

  roles.default = {
    interface =
      { lib, ... }:
      {
        options = {
          username = lib.mkOption {
            type = lib.types.str;
            description = "Username for which to manage the home configuration";
          };

          stateVersion = lib.mkOption {
            type = lib.types.str;
            default = "24.05";
            description = "Home Manager state version";
          };

          homeManagerConfig = lib.mkOption {
            type = lib.types.attrsOf lib.types.anything;
            default = { };
            description = ''
              Home Manager configuration. This can include any valid
              home-manager option such as programs, services, home.packages, etc.

              The configuration is passed directly to home-manager, allowing full
              access to all home-manager modules and options.
            '';
            example = lib.literalExpression ''
              {
                programs.git = {
                  enable = true;
                  userName = "John Doe";
                  userEmail = "john@example.com";
                };
                programs.zsh = {
                  enable = true;
                  oh-my-zsh.enable = true;
                };
                home.packages = with pkgs; [ htop ripgrep ];
              }
            '';
          };
        };
      };

    perInstance =
      { settings, ... }:
      {
        nixosModule =
          {
            config,
            clan-core,
            lib,
            ...
          }:
          {
            imports = [ clan-core.inputs.home-manager.nixosModules.home-manager ];

            home-manager = lib.mkIf (config.users.users ? ${settings.username}) {
              useGlobalPkgs = true;
              useUserPackages = true;

              users.${settings.username} = lib.mkMerge [
                {
                  home.stateVersion = settings.stateVersion;
                }
                settings.homeManagerConfig
              ];
            };
          };
      };
  };
}
