# Real-world example: Multi-user development team with laptops and servers
# Based on actual production configuration

_:
let
  roster-users = {
    # Team lead with full access everywhere
    alex = {
      description = "Alex - Team Lead";
      defaultUid = 3801;
      defaultGroups = [
        "audio"
        "networkmanager"
        "video"
        "input"
        "plugdev"
      ];
      sshAuthorizedKeys = [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJeeoL1jwVSachA9GdJxm/5TgCRBULfSDGLyP/nfmkMq alex@DESKTOP-SVRV9Q8"
      ];
      defaultPosition = "owner";
      defaultShell = "fish";
    };

    # Senior developer with admin access
    brittonr = {
      description = "Britton - Senior Developer";
      defaultUid = 1555;
      defaultGroups = [
        "wheel"
        "networkmanager"
        "video"
        "input"
        "kvm"
      ];
      sshAuthorizedKeys = [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILYzh3yIsSTOYXkJMFHBKzkakoDfonm3/RED5rqMqhIO britton@framework"
      ];
      defaultPosition = "owner";
      defaultShell = "fish";
    };

    # Junior developer with limited server access
    dima = {
      description = "Dima - Developer";
      defaultUid = 8070;
      defaultGroups = [
        "audio"
        "networkmanager"
        "video"
        "input"
        "plugdev"
      ];
      sshAuthorizedKeys = [
        "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIP++JHcHDQfP5wcPxtb8o4liBWo+DFS13I4a9UgSTFec dima@nixos"
      ];
      defaultPosition = "owner"; # Owner on personal machines
      defaultShell = "fish";
    };
  };

  roster-machines = {
    # Personal laptop with full desktop environment
    alex-fw = {
      users = {
        alex = {
          position = "owner";
          homeManager = {
            enable = true;
            profiles = [
              "base" # Shell, git, ssh configs
              "dev" # Development tools
              "hyprland" # Wayland compositor
              "hypr-laptop" # Laptop-specific (battery, brightness)
              "creative" # Creative tools (OBS, etc)
              "social" # Communication apps
            ];
          };
        };
      };

      # Machine-specific monitor configuration
      homeManagerOptions = {
        sharedModules = [
          {
            wayland.windowManager.hyprland.settings.monitor = [
              "eDP-1,2880x1920@120,auto,2"
              "DP-3,preferred,auto,1,mirror,eDP-1"
            ];
          }
        ];
      };
    };

    # Development server with multiple users
    aspen1 = {
      users = {
        alex = {
          position = "owner";
          homeManager = {
            enable = true;
            profiles = [
              "base"
              "dev"
            ]; # Just essentials on servers
          };
        };
        brittonr = {
          position = "owner";
          homeManager = {
            enable = true;
            profiles = [
              "base"
              "dev"
            ];
          };
        };
      };
    };

    # Kubernetes nodes with restricted access
    gmk1 = {
      users = {
        brittonr = {
          position = "owner"; # Admin access
          homeManager = {
            enable = true;
            profiles = [
              "base"
              "dev"
            ];
          };
        };
        dima = {
          position = "basic"; # Limited access
          shell = "zsh"; # Override default shell
          homeManager = {
            enable = true;
            profiles = [ ]; # No profiles, just basics
          };
        };
      };
    };

    # Shared workstation with full desktop
    zenith = {
      users = {
        alex = {
          position = "owner";
          homeManager = {
            enable = true;
            profiles = [
              "base"
              "dev"
              "hyprland"
              "hypr-laptop"
              "creative"
              "social"
            ];
          };
        };
        dima = {
          position = "owner"; # Both users are owners here
          homeManager = {
            enable = true;
            profiles = [
              "base"
              "dev"
              "hyprland"
              "hypr-laptop"
              "creative"
              "social"
            ];
          };
        };
      };
    };
  };
in
{
  instances = {
    roster = {
      module.name = "roster";
      roles.default.tags.all = { };
      roles.default.settings = {
        users = roster-users;
        machines = roster-machines;
        homeProfilesPath = ../home-profiles;

        # Global home-manager settings
        homeManagerOptions = {
          useGlobalPkgs = true;
          useUserPackages = true;
          backupFileExtension = "backup";
        };
      };
    };
  };
}
