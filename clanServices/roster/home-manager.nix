{ lib }:
rec {
  # Check if home-manager is enabled for a user on this machine
  isHomeManagerEnabled = _machineName: userConfig: userConfig.machineConfig.homeManager.enable;

  # Get the profiles to load for a user
  getUserProfiles = _machineName: userConfig: userConfig.machineConfig.homeManager.profiles;

  # Get all .nix files from a profile directory as import paths
  getProfileImports =
    profileDir:
    let
      nixFiles = lib.filterAttrs (name: type: type == "regular" && lib.hasSuffix ".nix" name) (
        builtins.readDir profileDir
      );
    in
    lib.mapAttrsToList (name: _: profileDir + "/${name}") nixFiles;

  # Generate the complete home-manager configuration for a user
  generateHomeConfig =
    settings: systemStateVersion: machineName: username: userConfig:
    let
      userProfilePath = settings.homeProfilesPath + "/${username}";
      userProfiles = getUserProfiles machineName userConfig;

      # Determine the stateVersion to use
      stateVersion =
        if userConfig.homeStateVersion != null then userConfig.homeStateVersion else systemStateVersion;

      # Get available profile directories
      profileItems =
        if builtins.pathExists userProfilePath then builtins.readDir userProfilePath else { };

      # Filter to only directories that are in the user's selected profiles
      profileDirs = lib.filterAttrs (
        name: type: type == "directory" && lib.elem name userProfiles
      ) profileItems;

      # Collect all import paths from selected profile directories
      profileImports = builtins.concatMap (
        profileName: getProfileImports (userProfilePath + "/${profileName}")
      ) (lib.attrNames profileDirs);
    in
    {
      imports = profileImports;
      home.stateVersion = lib.mkDefault stateVersion;
    };
}
