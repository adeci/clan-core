{
  _class,
  pkgs,
  config,
  lib,
  ...
}:
{

  warnings = [
    "The clan.root-password module is deprecated and will be removed on 2025-07-15.
      Please migrate to user-maintained configuration or the new equivalent clan services
      (https://docs.clan.lol/reference/clanServices)."
  ];

  users.mutableUsers = false;
  users.users.root.hashedPasswordFile =
    config.clan.core.vars.generators.root-password.files.password-hash.path;

  clan.core.vars.generators.root-password = {
    files.password-hash =
      {
        neededFor = "users";
      }
      // (lib.optionalAttrs (_class == "nixos") {
        restartUnits = lib.optional (config.services.userborn.enable) "userborn.service";
      });
    files.password = {
      deploy = false;
    };
    migrateFact = "root-password";
    runtimeInputs = [
      pkgs.coreutils
      pkgs.mkpasswd
      pkgs.xkcdpass
    ];
    prompts.password.type = "hidden";
    prompts.password.persist = true;
    prompts.password.description = "You can autogenerate a password, if you leave this prompt blank.";

    script = ''
      prompt_value="$(cat "$prompts"/password)"
      if [[ -n "''${prompt_value-}" ]]; then
        echo "$prompt_value" | tr -d "\n" > "$out"/password
      else
        xkcdpass --numwords 4 --delimiter - --count 1 | tr -d "\n" > "$out"/password
      fi
      mkpasswd -s -m sha-512 < "$out"/password | tr -d "\n" > "$out"/password-hash
    '';
  };
}
