# We don't have a way of specifying dependencies between clanServices for now.
# When it get's added this file should be removed and the users module used instead.
{
  config,
  pkgs,
  ...
}:
{

  users.mutableUsers = false;
  users.users.root.hashedPasswordFile =
    config.clan.core.vars.generators.root-password.files.password-hash.path;

  clan.core.vars.generators.root-password = {
    files.password-hash.neededFor = "users";

    files.password.deploy = false;

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
        xkcdpass --numwords 5 --delimiter - --count 1 | tr -d "\n" > "$out"/password
      fi
      mkpasswd -s -m sha-512 < "$out"/password | tr -d "\n" > "$out"/password-hash
    '';
  };
}
