# Roster Service

Unified user and home environment management across your entire machine fleet.

## Overview

The roster service provides centralized user management with:
- **Machine-centric configuration** - Define users per machine, not machines per user
- **Position-based access control** - Assign users to positions (owner, admin, basic, service) with predefined permissions
- **Home-manager integration** - Automatically configure user environments with profile-based home configurations
- **Automatic password generation** - Securely generate passwords for administrative users
- **SSH key management** - Centralized SSH authorized keys with automatic root access for owners/admins

## Quick Start

```nix
# inventory/roster.nix
let
  roster-users = {
    alice = {
      description = "Alice Smith";
      defaultUid = 1001;
      defaultGroups = [ "networkmanager" "video" ];
      sshAuthorizedKeys = [ "ssh-ed25519 AAAA..." ];
      defaultPosition = "owner";
      defaultShell = "fish";
    };

    bob = {
      description = "Bob Jones";
      defaultUid = 1002;
      defaultGroups = [ "networkmanager" ];
      sshAuthorizedKeys = [ "ssh-ed25519 BBBB..." ];
      defaultPosition = "basic";
      defaultShell = "bash";
    };
  };

  roster-machines = {
    workstation = {
      users = {
        alice = {
          position = "owner";  # Full admin with password
          homeManager = {
            enable = true;
            profiles = [ "dev" "desktop" ];
          };
        };
        bob = {
          position = "basic";  # Regular user
          homeManager = {
            enable = true;
            profiles = [ "minimal" ];
          };
        };
      };
    };

    server = {
      users = {
        alice = {
          position = "admin";  # Admin without auto-password
          shell = "/bin/sh";   # Override default shell
          homeManager.enable = false;  # No home-manager on servers
        };
      };
    };
  };
in {
  services.self-roster = {
    settings = {
      users = roster-users;
      machines = roster-machines;
      homeProfilesPath = ./home-profiles;
    };
  };
}
```

## Core Concepts

### Users
Define each user once with their identity and defaults:
- **Identity**: Description, SSH keys, default UID
- **Defaults**: Default groups, position, shell
- **Overrides**: Home state version for specific NixOS compatibility

### Machines
Each machine declares its users and their specific configuration:
- **Position**: Role on this specific machine (owner/admin/basic/service)
- **Overrides**: Machine-specific shell, UID, or groups
- **Home-manager**: Enable and select profiles for this machine
- **Machine options**: Shared home-manager settings (e.g., monitor configuration)

### Positions
Pre-defined permission sets that users are assigned to:

| Position | Root Access | Password Gen | Home Dir | Login | Use Case |
|----------|------------|--------------|----------|-------|----------|
| `owner`  | ✓ | ✓ | ✓ | ✓ | Primary admin with generated password |
| `admin`  | ✓ | ✗ | ✓ | ✓ | Additional admin, brings own password |
| `basic`  | ✗ | ✗ | ✓ | ✓ | Regular user without privileges |
| `service`| ✗ | ✗ | ✗ | ✗ | System service account |

## Home Profiles

Organize user configurations into composable profiles:

```
home-profiles/
├── alice/
│   ├── dev/          # Development environment profile
│   │   ├── git.nix
│   │   ├── neovim.nix
│   │   └── tools.nix
│   └── desktop/      # Desktop environment profile
│       ├── hyprland.nix
│       ├── firefox.nix
│       └── theme.nix
└── bob/
└── minimal/      # Minimal setup
└── shell.nix
```

Users select which profiles to load per machine - no duplication of configurations.

## Advanced Features

### Machine-Specific Home-Manager Options

Configure per-machine settings that apply to all users:

```nix
roster-machines = {
  laptop = {
    users = { ... };
      homeManagerOptions = {
        sharedModules = [{
          # Monitor config for this specific laptop
          wayland.windowManager.hyprland.settings.monitor = [
            "eDP-1,2880x1920@120,auto,2"
          ];
        }];
      };
  };
};
```

### Custom Position Definitions

Override or extend the default positions:

```nix
services.self-roster = {
  settings = {
    positionDefinitions = {
      contractor = {
        hasRootAccess = false;
        generatePassword = false;
        additionalGroups = [ "docker" "development" ];
        isSystemUser = false;
        createHome = true;
        shell = "/run/current-system/sw/bin/bash";
        description = "External contractor with limited access";
      };
    };
  };
};
```

### Global Home-Manager Options

Configure home-manager behavior across all machines:

```nix
services.self-roster = {
  settings = {
    homeManagerOptions = {
      useGlobalPkgs = true;        # Use system nixpkgs
      useUserPackages = true;       # Install to /etc/profiles
      backupFileExtension = "bak";  # Backup existing files as .bak
      verbose = false;              # Quiet activation
    };
  };
};
```

## Benefits

1. **Single Source of Truth**: Each user and machine defined exactly once
2. **No Redundancy**: Machine configurations aren't duplicated across user definitions
3. **Flexible Overrides**: Defaults at user level, overrides at machine level
4. **Composable Profiles**: Mix and match home-manager profiles per machine
5. **Type Safety**: Full NixOS module type checking prevents configuration errors
6. **Secure by Default**: Automatic password generation for admins, SSH key management
7. **Scalable**: Add new machines or users without touching existing configs

## Migration from Traditional Setup

Traditional NixOS:
```nix
# Scattered across multiple files
users.users.alice = { ... };
users.users.bob = { ... };
home-manager.users.alice = { ... };
home-manager.users.bob = { ... };
```

With Roster:
```nix
# All in one place, DRY principle
roster-users = { alice = { ... }; bob = { ... }; };
  roster-machines = { 
    machine1 = { users = { alice = { ... }; }; };
  };
```

## Complete Example

See the [examples directory](./examples/) for complete configurations including:
- Multi-machine development environment
- Laptop with full desktop environment
- Headless server setup
- Service account configuration
