# Home Manager Service

This service provides seamless Home Manager integration for managing user environments declaratively through NixOS modules.

## Features

- **Full Home Manager Access**: Exposes all home-manager options without manual definition using the `attrsOf anything` pattern
- **Declarative Configuration**: Manage user environments through NixOS configuration
- **Tag-based Deployment**: Deploy only to machines with the "home-manager" tag
- **Zero Option Lock-in**: New home-manager options are automatically supported without service updates

## Usage

The service allows you to configure any home-manager option through the `homeManagerConfig` attribute:

```nix
{
  services.home-manager = {
    alice = {
      roles.default.tags."home-manager" = {};
      roles.default.settings = {
        username = "alice";
        stateVersion = "24.05";
        homeManagerConfig = {
          # Any home-manager option can be set here
          programs.git = {
            enable = true;
            userName = "Alice Smith";
            userEmail = "alice@example.com";
          };
          
          programs.zsh = {
            enable = true;
            oh-my-zsh = {
              enable = true;
              theme = "robbyrussell";
            };
          };
          
          home.packages = with pkgs; [
            htop
            ripgrep
            fd
          ];
          
          services.gpg-agent = {
            enable = true;
            enableSshSupport = true;
          };
        };
      };
    };
  };
}
```

## Options

### Required Options

- `username` (string): The username for which to manage the home configuration

### Optional Options

- `stateVersion` (string): Home Manager state version (default: "24.05")
- `homeManagerConfig` (attribute set): Any valid home-manager configuration options

## Design Pattern

This service leverages the `attrsOf anything` type pattern for the `homeManagerConfig` option, which provides:

1. **No Manual Definitions**: You don't need to define every home-manager option
2. **Direct Pass-through**: Configuration is passed directly to home-manager
3. **Full Compatibility**: Any valid home-manager configuration works
4. **Future-proof**: New home-manager options are automatically supported

## Tag-based Deployment

Add the "home-manager" tag to machines that should have home-manager configurations:

```nix
{
  machines.myMachine = {
    name = "myMachine";
    tags = [ "home-manager" "desktop" ];
  };
}
```

## Advanced Usage

### Multiple User Configurations

You can define multiple home-manager instances for different users:

```nix
{
  services.home-manager = {
    alice = {
      roles.default.tags."home-manager" = {};
      roles.default.settings = {
        username = "alice";
        # Alice's configuration
      };
    };
    
    bob = {
      roles.default.tags."home-manager" = {};
      roles.default.settings = {
        username = "bob";
        # Bob's configuration
      };
    };
  };
}
```

### Machine-specific Configurations

Use different tags to deploy different configurations to different machine types:

```nix
{
  services.home-manager = {
    alice-desktop = {
      roles.default.tags."desktop" = {};
      roles.default.settings = {
        username = "alice";
        homeManagerConfig = {
          # Desktop-specific configuration
          wayland.windowManager.hyprland.enable = true;
        };
      };
    };
    
    alice-server = {
      roles.default.tags."server" = {};
      roles.default.settings = {
        username = "alice";
        homeManagerConfig = {
          # Server-specific configuration
          programs.tmux.enable = true;
        };
      };
    };
  };
}
```

## Technical Details

The service automatically:
- Imports home-manager's NixOS module from clan-core's flake inputs
- Configures home-manager to use global packages (`useGlobalPkgs = true`)
- Enables user package management (`useUserPackages = true`)
- Sets the home state version from the service settings
- Spreads all `homeManagerConfig` options directly into the user's home-manager configuration

## Compatibility

- Requires clan-core with home-manager flake input
- Compatible with any NixOS system using clan-core
- Works with all home-manager modules and options