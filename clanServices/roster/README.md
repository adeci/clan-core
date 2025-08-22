# Roster Module

A comprehensive user management service for clan-core that combines position-based access control with home-manager integration.

## Overview

The roster module provides:
- **Centralized user management** across all machines
- **Position-based access control** (owner, admin, basic, service)
- **Automatic password generation** for owner accounts
- **SSH key management** with root access for privileged users
- **Home-manager integration** with profile-based configuration
- **Shell provisioning** based on user preferences

## Usage

```nix
{
  inventory.instances = {
    roster = {
      module.name = "roster";
      positions.default.tags.all = { };  # Apply to all machines
      positions.default.settings = {
        users = import ./users.nix { };
        homeProfilesPath = ../home-profiles;
      };
    };
  };
}
```

## Configuration

### Minimal Example

```nix
{
  services.roster = {
    positions.default.tags.all = { };
    positions.default.settings = {
      users = {
        alice = {
          description = "Alice Smith";
          defaultUid = 1000;
          sshAuthorizedKeys = [ "ssh-ed25519 AAA..." ];
          machines.server1 = {
            position = "owner";
            shell = "bash";
            homeManager = {
              enable = true;
              profiles = [ "base" "desktop" ];
            };
          };
        };
      };
      homeProfilesPath = ../home-profiles;
    };
  };
}
```

## User Positions

### owner
- Full sudo access via wheel group
- Password automatically generated via clan secrets
- SSH keys added to root's authorized_keys
- Intended for primary system administrators

### admin
- Full sudo access via wheel group
- Must provide own password
- SSH keys added to root's authorized_keys
- Intended for additional administrators

### basic
- Standard user account
- No sudo access
- Must provide own password
- Intended for regular users

### service
- System user account
- No login shell (`/bin/false`)
- No home directory
- Intended for running services

## Home-Manager Integration

### Profile System

When `homeProfilesPath` is set, users can have home-manager configurations organized by profiles:

```
home-profiles/
├── alice/
│   ├── base/             # Always loaded when specified
│   │   ├── git.nix
│   │   └── zsh.nix
│   ├── desktop/          # Desktop environment configs
│   │   ├── firefox.nix
│   │   └── alacritty.nix
│   └── dev/              # Development tools
│       ├── neovim.nix
│       └── vscode.nix
└── bob/
    ├── base/
    │   └── fish.nix
    └── dev/
        └── emacs.nix
```

### Profile Selection

Users can specify which profiles to load on each machine:

```nix
machines = {
  laptop = {
    position = "owner";
    homeManager = {
      enable = true;
      profiles = [ "base" "desktop" "dev" ];  # Load all three profiles
    };
  };
  server = {
    position = "admin";
    homeManager = {
      enable = true;
      profiles = [ "base" ];  # Only load base profile
    };
  };
};
```

### Default Behavior

- `homeManager = { enable = true; }` - Defaults to `profiles = [ "base" ]`
- `homeManager = {}` or omitted - No home-manager configuration (enable defaults to false)
- Files in user's root profile directory are always loaded
- `stateVersion.nix` can be placed in user's directory to set home-manager state version

## Password Management

Passwords are managed via clan's secrets system:

### Owner Position
- Password automatically generated if not provided
- Stored as `user-password-<username>` secret
- Can be overridden by providing password when prompted

### Other Positions
- Must provide password through other means
- No automatic generation

### Commands
```bash
# Generate password for owner
clan secrets generate user-password-alice

# View generated password
clan secrets get user-password-alice --password
```

## Machine-Specific Settings

Users can have different configurations per machine:

```nix
alice = {
  defaultUid = 1000;
  defaultGroups = [ "wheel" ];
  machines = {
    server = {
      position = "owner";
      shell = "bash";
      # Use defaults for uid and groups
    };
    workstation = {
      position = "admin";
      shell = "zsh";
      uid = 1001;  # Override default
      groups = [ "audio" "video" ];  # Override default groups
    };
  };
};
```

## Complete Example

```nix
{
  services.roster = {
    positions.default.tags.all = { };
    positions.default.settings = {
      users = {
        # Primary administrator
        alice = {
          description = "Alice Smith";
          defaultUid = 1000;
          defaultGroups = [ "wheel" "networkmanager" ];
          sshAuthorizedKeys = [
            "ssh-ed25519 AAAAC3NzaC1... alice@laptop"
          ];
          machines = {
            server1 = {
              position = "owner";
              shell = "bash";
            };
            workstation = {
              position = "owner";
              shell = "zsh";
              homeManager = {
                enable = true;
                profiles = [ "base" "desktop" "dev" ];
              };
            };
          };
        };

        # Additional admin
        bob = {
          description = "Bob Jones";
          defaultUid = 1001;
          defaultGroups = [ "wheel" ];
          sshAuthorizedKeys = [
            "ssh-ed25519 AAAAC3NzaC1... bob@desktop"
          ];
          machines = {
            server1 = {
              position = "admin";
              shell = "fish";
              homeManager = {
                enable = true;
                profiles = [ "base" ];
              };
            };
          };
        };

        # Service account
        webserver = {
          description = "Web Server User";
          defaultUid = 8080;
          defaultGroups = [ ];
          sshAuthorizedKeys = [ ];
          machines = {
            server1 = {
              position = "service";
            };
          };
        };
      };

      homeProfilesPath = ../home-profiles;
    };
  };
}
```

## Integration with Inventory

Roster works seamlessly with clan's inventory system. Define it once and deploy to all machines:

```nix
# inventory/core/default.nix
{
  instances = {
    roster = {
      module.name = "roster";
      positions.default.tags.all = { };  # Deploy to all machines
      positions.default.settings = {
        users = import ./users.nix { };
        homeProfilesPath = ../home-profiles;
      };
    };
  };
}
```

## Notes

- User groups are automatically created with `gid = null` (auto-assigned)
- The module sets `users.mutableUsers = false` for declarative user management
- Shell programs are automatically enabled based on user assignments
- Root user always gets SSH keys from users with owner/admin positions
- Profile directories are loaded based on explicit user selection, not machine tags
