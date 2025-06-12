{ ... }:
{
  _class = "clan.service";
  manifest.name = "clan-core/thelounge";
  manifest.description = "Modern web IRC client";
  manifest.categories = [ "Social" ];

  roles.default = {

    perInstance =
      { ... }:
      {
        nixosModule =
          { ... }:
          {

            services.thelounge = {
              enable = true;
              public = true;
              extraConfig = {
                prefetch = true;
                defaults = {
                  port = 6667;
                  tls = false;
                };
              };
            };

            clan.core.state.thelounde.folders = [ "/var/lib/thelounge" ];

          };
      };
  };
}
