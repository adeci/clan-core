{ lib, ... }:
{
  # defaults
  config.clanCore.state.HOME.folders = [ "/home" ];

  # interface
  options.clanCore.state = lib.mkOption {
    default = { };
    type = lib.types.attrsOf (
      lib.types.submodule (
        { ... }:
        {
          options = {
            folders = lib.mkOption {
              type = lib.types.listOf lib.types.str;
              description = ''
                Folder where state resides in
              '';
            };
            preRestoreCommand = lib.mkOption {
              type = lib.types.nullOr lib.types.str;
              default = null;
              description = ''
                script to run before restoring the state dir from a backup

                Utilize this to stop services which currently access these folders
              '';
            };
            postRestoreCommand = lib.mkOption {
              type = lib.types.nullOr lib.types.str;
              default = null;
              description = ''
                script to restore the service after the state dir was restored from a backup

                Utilize this to start services which were previously stopped
              '';
            };
          };
        }
      )
    );
  };
}
