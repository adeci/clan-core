# user-assignments

Centralized user management across multiple machines with role-based access control.

## Usage

Define all users in one place and assign them to specific machines with roles:

```nix
{
  alice = {
    description = "Alice";
    defaultUid = 3801;
    defaultGroups = [ "audio" "networkmanager" "video" ];
    sshAuthorizedKeys = [ "ssh-ed25519 ..." ];
    machines = {
      server1 = { role = "owner"; };
      server2 = { role = "basic"; };
      laptop = { role = "owner"; };
    };
  };
}
```

## Roles

Four predefined roles cover most use cases:

- **owner**: Primary admin with sudo and auto-generated password
- **admin**: Trusted admin with sudo, brings own password
- **basic**: Regular user without admin privileges
- **service**: System account for services (no login)

## Key Features

- Single source of truth for all users
- Consistent UIDs across machines
- Automatic SSH key deployment to root for admins/owners
- Password generation for owners via clan vars
- Machine-specific overrides for special cases

## Machine Overrides

Override user settings per machine when needed:

```nix
machines = {
  special-server = {
    role = "admin";
    uid = 2000;                    # Different UID
    groups = [ "docker" "wheel" ]; # Replace default groups
    shell = "/bin/zsh";            # Different shell
  };
};
```

## Comparison with `users` Service

| | users | user-assignments |
|---|---|---|
| Scope | One user per instance | All users in one instance |
| Best for | Simple, single users | Multi-machine infrastructures |
| Roles | None | owner/admin/basic/service |

Choose `user-assignments` when managing users across multiple machines from a central location.
