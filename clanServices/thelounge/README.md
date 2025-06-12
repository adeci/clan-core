The Lounge is a modern, self-hosted web IRC client designed for accessibility
and convenience. Whether you're on desktop or mobile, it keeps you connected and
in sync across devices, without need for a separate IRC bouncer.

## Usage

```nix
inventory.instances = {
  mylounge = {
    module = {
      name = "thelounge";
      input = "clan";
    };
    roles.default.machines.server01 = { };
  };
}
```
