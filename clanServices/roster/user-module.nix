# User module builder using NixOS module system
{ lib, pkgs }:
rec {
  # Build a modular user configuration using mkMerge
  buildUserModule = machineName: username: userConfig: positionConfig: config:
    let
      machineConfig = userConfig.machines.${machineName};

      # Determine final shell value
      shellValue = 
        if machineConfig ? shell && machineConfig.shell != null then
          pkgs.${baseNameOf machineConfig.shell}
        else if positionConfig ? shell && positionConfig.shell != null then
          pkgs.${baseNameOf positionConfig.shell}
        else
          null;

      # Determine final groups
      groupsValue =
        if machineConfig ? groups && machineConfig.groups != null then
          machineConfig.groups  # Machine-specific replaces all
        else
          (userConfig.defaultGroups or []) ++ positionConfig.additionalGroups;

      # Determine final UID
      uidValue =
        if machineConfig ? uid && machineConfig.uid != null then
          machineConfig.uid
        else
          userConfig.defaultUid or null;
    in
      lib.mkMerge [
        # Base configuration
        {
          isNormalUser = !positionConfig.isSystemUser;
          isSystemUser = positionConfig.isSystemUser;
          createHome = positionConfig.createHome;
          group = username;
          description = userConfig.description;
          openssh.authorizedKeys.keys = userConfig.sshAuthorizedKeys or [];
          extraGroups = groupsValue;
          uid = lib.mkIf (uidValue != null) uidValue;
        }

        # Shell configuration (only if not null)
        (lib.mkIf (shellValue != null) {
          shell = shellValue;
        })

        # Password file for positions with generatePassword
        (lib.mkIf positionConfig.generatePassword {
          hashedPasswordFile = 
            config.clan.core.vars.generators."user-password-${username}".files."${username}-password-hash".path;
        })
      ];

  # Get users assigned to a specific machine
  getMachineUsers = machineName: allUsers:
    lib.filterAttrs 
    (_username: userCfg: userCfg.machines ? ${machineName}) 
    allUsers;

  # Get SSH keys for root from users with root access
  getRootAuthorizedKeys = machineName: machineUsers: positionDefinitions:
    lib.concatLists (
      lib.mapAttrsToList (
        _username: userConfig:
        let
          machineConfig = userConfig.machines.${machineName};
          positionConfig = positionDefinitions.${machineConfig.position};
        in
          if positionConfig.hasRootAccess then 
          userConfig.sshAuthorizedKeys or []
        else 
          []
      ) machineUsers
    );

  # Get list of unique shells used by all users
  getRequiredShells = machineName: machineUsers: positionDefinitions:
    let
      shellsFromUsers = lib.mapAttrsToList (
        _: user:
        let
          machineConfig = user.machines.${machineName};
          positionConfig = positionDefinitions.${machineConfig.position};
        in
          if machineConfig ? shell && machineConfig.shell != null then
          machineConfig.shell
        else
          positionConfig.shell or null
      ) machineUsers;
    in
      lib.unique (lib.filter (s: s != null && s != "/bin/false") shellsFromUsers);

  # Get users that need password generation
  getUsersWithPasswordGeneration = machineName: machineUsers: positionDefinitions:
    lib.filterAttrs (
      _username: userConfig:
      let
        machineConfig = userConfig.machines.${machineName};
        positionConfig = positionDefinitions.${machineConfig.position};
      in
        positionConfig.generatePassword
    ) machineUsers;

  # Validate user configuration
  validateUserConfig = username: userConfig:
    let
      errors = [];

      missingDescription = if !(userConfig ? description) then 
        ["User ${username} is missing 'description' field"] 
      else [];

      missingMachines = if !(userConfig ? machines) || userConfig.machines == {} then
        ["User ${username} has no machine assignments"]
      else [];

      machineErrors = lib.concatLists (
        lib.mapAttrsToList (machineName: machineConfig:
          let
            missingPosition = if !(machineConfig ? position) then
              ["User ${username} on machine ${machineName} is missing 'position' field"]
            else [];
          in
            missingPosition
        ) (userConfig.machines or {})
      );
    in
      errors ++ missingDescription ++ missingMachines ++ machineErrors;
}
