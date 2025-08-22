# Home-manager integration for the roster service
# Handles profile loading and home configuration generation
{ lib }:
rec {
  # Check if home-manager is enabled for a user on this machine
  # Now much simpler - just check the enable field with proper default
  isHomeManagerEnabled = machineName: userConfig:
    let
      hmConfig = userConfig.machines.${machineName}.homeManager or {};
    in
    hmConfig.enable or false;

  # Get the profiles to load for a user
  # Simpler with proper typing - no need to check if bool
  getUserProfiles = machineName: userConfig:
    let
      hmConfig = userConfig.machines.${machineName}.homeManager or {};
    in
    hmConfig.profiles or [ "base" ];

  # Load state version from user's profile directory if it exists
  loadStateVersion = userProfilePath:
    if builtins.pathExists (userProfilePath + "/stateVersion.nix") then
      import (userProfilePath + "/stateVersion.nix")
    else
      "24.05";

  # Load all .nix files from a profile directory
  loadProfileDirectory = profileDir:
    let
      nixFiles = lib.filterAttrs 
        (name: type: type == "regular" && lib.hasSuffix ".nix" name) 
        (builtins.readDir profileDir);
      configs = lib.mapAttrsToList 
        (name: _: import (profileDir + "/${name}")) 
        nixFiles;
    in
    lib.mkMerge configs;

  # Load root .nix files from user's profile directory (excluding stateVersion.nix)
  loadRootFiles = userProfilePath:
    let
      profileItems = 
        if builtins.pathExists userProfilePath then 
          builtins.readDir userProfilePath 
        else 
          { };
      rootNixFiles = lib.filterAttrs 
        (name: type: 
          type == "regular" && 
          lib.hasSuffix ".nix" name && 
          name != "stateVersion.nix") 
        profileItems;
    in
    lib.mkMerge (
      lib.mapAttrsToList 
        (name: _: import (userProfilePath + "/${name}")) 
        rootNixFiles
    );

  # Generate the complete home-manager configuration for a user
  generateHomeConfig = settings: machineName: username: userConfig:
    let
      userProfilePath = settings.homeProfilesPath + "/${username}";
      userProfiles = getUserProfiles machineName userConfig;
      stateVersion = loadStateVersion userProfilePath;
      
      # Get available profile directories
      profileItems = 
        if builtins.pathExists userProfilePath then 
          builtins.readDir userProfilePath 
        else 
          { };
      
      # Filter to only directories that are in the user's selected profiles
      profileDirs = lib.filterAttrs 
        (name: type: type == "directory" && lib.elem name userProfiles) 
        profileItems;
      
      # Load configurations from selected profile directories
      profileConfigs = lib.mkMerge (
        lib.mapAttrsToList 
          (profileName: _: loadProfileDirectory (userProfilePath + "/${profileName}"))
          profileDirs
      );
      
      # Load root files
      rootConfigs = loadRootFiles userProfilePath;
    in
    lib.mkMerge [
      { home.stateVersion = stateVersion; }
      profileConfigs
      rootConfigs
    ];

  # Filter users that have home-manager enabled for this machine
  filterHomeManagerUsers = machineName: users:
    lib.filterAttrs 
      (_username: userCfg: isHomeManagerEnabled machineName userCfg) 
      users;
}