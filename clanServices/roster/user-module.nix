{ lib, pkgs }:
rec {
  # Get the position for a user with fallback logic
  getUserPosition =
    userConfig: fallback:
    if userConfig.machineConfig.position != null then
      userConfig.machineConfig.position
    else if userConfig.defaultPosition != null then
      userConfig.defaultPosition
    else
      fallback;

  # Build a modular user configuration
  buildUserModule =
    _machineName: username: userConfig: positionConfig: config:
    let
      # Machine config is now attached to userConfig
      machineConfig = userConfig.machineConfig;

      # Determine final shell value with precedences (machine > user default > position > null)
      shellValue =
        if machineConfig.shell != null then
          pkgs.${baseNameOf machineConfig.shell}
        else if userConfig.defaultShell != null then
          pkgs.${baseNameOf userConfig.defaultShell}
        else if positionConfig.shell != null then
          pkgs.${baseNameOf positionConfig.shell}
        else
          null;

      # Determine final groups (machine overrides all, otherwise combine defaults + position)
      groupsValue =
        if machineConfig.groups != null then
          machineConfig.groups
        else
          (userConfig.defaultGroups or [ ]) ++ positionConfig.additionalGroups;

      # Determine final UID (machine > user default > null)
      uidValue = if machineConfig.uid != null then machineConfig.uid else userConfig.defaultUid or null;
    in
    lib.mkMerge [
      # Base configuration
      {
        isNormalUser = !positionConfig.isSystemUser;
        isSystemUser = positionConfig.isSystemUser;
        createHome = positionConfig.createHome;
        group = username;
        description = userConfig.description;
        openssh.authorizedKeys.keys = userConfig.sshAuthorizedKeys or [ ];
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

  # Get SSH keys for root from users with root access
  getRootAuthorizedKeys =
    _machineName: machineUsers: positionDefinitions:
    lib.concatLists (
      lib.mapAttrsToList (
        _username: userConfig:
        let
          position = getUserPosition userConfig "basic";
          positionConfig = positionDefinitions.${position};
        in
        if positionConfig.hasRootAccess then userConfig.sshAuthorizedKeys or [ ] else [ ]
      ) machineUsers
    );

  # Get list of unique shells used by all users
  getRequiredShells =
    _machineName: machineUsers: positionDefinitions:
    let
      shellsFromUsers = lib.mapAttrsToList (
        _: user:
        let
          machineConfig = user.machineConfig;
          position = getUserPosition user (throw "No position defined for user in getRequiredShells");
          positionConfig = positionDefinitions.${position};
        in
        if machineConfig.shell != null then
          machineConfig.shell
        else if user.defaultShell != null then
          user.defaultShell
        else
          positionConfig.shell or null
      ) machineUsers;
    in
    lib.unique (lib.filter (s: s != null && s != "/bin/false") shellsFromUsers);

  # Get users that need password generation
  getUsersWithPasswordGeneration =
    _machineName: machineUsers: positionDefinitions:
    lib.filterAttrs (
      _username: userConfig:
      let
        position = getUserPosition userConfig "basic";
        positionConfig = positionDefinitions.${position};
      in
      positionConfig.generatePassword
    ) machineUsers;

}
