# user-assignments

Centralized user management across multiple machines with role-based access control.

## Usage

Create a single instance that manages all users across your infrastructure:

```nix
inventory.instances = {
  user-assignments = {
    module.name = "user-assignments";
    roles.default.tags.all = { };  # Deploy to all machines
    roles.default.settings = {
      users = {
        alice = {
          description = "Alice Administrator";
          defaultUid = 3800;
          defaultGroups = [ "wheel" "networkmanager" ];
          sshAuthorizedKeys = [ "ssh-ed25519 AAAAC3..." ];
          machines = {
            server1 = { role = "owner"; };
            server2 = { role = "admin"; };
            laptop = {
              role = "owner";
              groups = [ "wheel" "docker" ];  # Override default groups
            };
          };
        };

        backup-service = {
          description = "Backup Service";
          defaultUid = 9001;
          defaultGroups = [ "backup" ];
          sshAuthorizedKeys = [ ];
          machines = {
            server1 = { role = "service"; };
          };
        };
      };
    };
  };
};
```

## Roles

- **owner**: Admin with sudo access and vars-set/auto-generated password
- **admin**: Admin with sudo access, password handled by owner
- **basic**: Regular user without admin privileges
- **service**: System account for services (no login shell)

## Machine Overrides

Override user settings per machine:

```nix
machines.special-server = {
  role = "admin";
  uid = 2000;                    # Different UID
  groups = [ "docker" "wheel" ]; # Replace default groups
  shell = "/bin/zsh";            # Different shell
};
```
