{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.clan.vaultwarden;
in

{
  imports = [
    (lib.mkRemovedOptionModule [
      "clan"
      "vaultwarden"
      "enable"
    ] "Importing the module will already enable the service.")
    ../nginx
  ];

  options.clan.vaultwarden = {
    domain = lib.mkOption {
      type = lib.types.str;
      example = "bitwarden.example.com";
      description = "The domain to use for Vaultwarden";
    };
    port = lib.mkOption {
      type = lib.types.int;
      default = 3011;
      description = "The port to use for Vaultwarden";
    };
    allow_signups = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Allow signups for new users";
    };

    smtp = {
      host = lib.mkOption {
        type = lib.types.str;
        example = "smtp.example.com";
        description = "The email server domain address";
      };
      from = lib.mkOption {
        type = lib.types.str;
        example = "foobar@example.com";
        description = "From whom the email is coming from";
      };
      username = lib.mkOption {
        type = lib.types.str;
        example = "foobar@example.com";
        description = "The email server username";
      };
    };
  };

  config = {

    clan.core.postgresql.enable = true;

    clan.core.postgresql.users.vaultwarden = { };
    clan.core.postgresql.databases.vaultwarden.create.options = {
      TEMPLATE = "template0";
      LC_COLLATE = "C";
      LC_CTYPE = "C";
      ENCODING = "UTF8";
      OWNER = "vaultwarden";
    };
    clan.core.postgresql.databases.vaultwarden.restore.stopOnRestore = [ "vaultwarden" ];

    services.nginx = {
      enable = true;
      virtualHosts = {
        "${cfg.domain}" = {
          forceSSL = true;
          enableACME = true;
          extraConfig = ''
            client_max_body_size 128M;
          '';
          locations."/" = {
            proxyPass = "http://localhost:${builtins.toString cfg.port}";
            proxyWebsockets = true;
          };
          locations."/notifications/hub" = {
            proxyPass = "http://localhost:${builtins.toString cfg.port}";
            proxyWebsockets = true;
          };
          locations."/notifications/hub/negotiate" = {
            proxyPass = "http://localhost:${builtins.toString cfg.port}";
            proxyWebsockets = true;
          };
        };
      };
    };

    clan.core.vars.generators = {
      vaultwarden-admin = {
        migrateFact = "vaultwarden-admin";
        files."vaultwarden-admin" = { };
        files."vaultwarden-admin-hash" = { };
        runtimeInputs = with pkgs; [
          coreutils
          pwgen
          libargon2
          openssl
        ];
        script = ''
          ADMIN_PWD=$(pwgen 16 -n1 | tr -d "\n")
          ADMIN_HASH=$(echo -n "$ADMIN_PWD" | argon2 "$(openssl rand -base64 32)" -e -id -k 65540 -t 3 -p 4)

          config="
          ADMIN_TOKEN=\"$ADMIN_HASH\"
          "
          echo -n "$ADMIN_PWD" > "$out"/vaultwarden-admin
          echo -n "$config" > "$out"/vaultwarden-admin-hash
        '';
      };
      vaultwarden-smtp = {
        migrateFact = "vaultwarden-smtp";
        prompts."vaultwarden-smtp".description = "${cfg.smtp.from} SMTP password";
        prompts."vaultwarden-smtp".persist = true;
        runtimeInputs = with pkgs; [ coreutils ];
        script = ''
          prompt_value="$(cat "$prompts"/vaultwarden-smtp)"
          config="
            SMTP_PASSWORD=\"$prompt_value\"
          "
          echo -n "$config" > "$out"/vaultwarden-smtp
        '';
      };
    };

    systemd.services."vaultwarden" = {
      serviceConfig = {
        EnvironmentFile = [
          config.clan.core.vars.generators."vaultwarden-smtp".files."vaultwarden-smtp".path
        ];
      };
    };

    services.vaultwarden = {
      enable = true;
      dbBackend = "postgresql";
      environmentFile =
        config.clan.core.vars.generators."vaultwarden-admin".files."vaultwarden-admin-hash".path; # TODO: Make this upstream an array
      config = {
        SMTP_SECURITY = "force_tls";
        SMTP_HOST = cfg.smtp.host;
        SMTP_FROM = cfg.smtp.from;
        SMTP_USERNAME = cfg.smtp.username;
        DOMAIN = "https://${cfg.domain}";
        SIGNUPS_ALLOWED = cfg.allow_signups;
        ROCKET_PORT = builtins.toString cfg.port;
        DATABASE_URL = "postgresql://"; # TODO: This should be set upstream if dbBackend is set to postgresql
        ENABLE_WEBSOCKET = true;
        ROCKET_ADDRESS = "127.0.0.1";
      };
    };

  };

}
