{
  pkgs,
  lib,
  options,
  ...
}:
{
  boot.isContainer = true;

  # needed since nixpkgs 7fb2f407c01b017737eafc26b065d7f56434a992 removed the getty unit by default
  console.enable = true;

  # undo qemu stuff
  system.build.initialRamdisk = "";
  virtualisation = lib.optionalAttrs (options ? virtualisation.sharedDirectories) {
    sharedDirectories = lib.mkForce { };
  };
  networking.useDHCP = false;

  # PAM requires setuid and doesn't work in our containers
  services.openssh.settings.UsePAM = false;

  # We use networkd to assign static ip addresses
  networking.useNetworkd = true;
  networking.useHostResolvConf = false;
  services.resolved.enable = false;

  # Rename the host0 interface to eth1 to match what we expect in VM tests.
  system.activationScripts.renameInterface = ''
    if ${pkgs.iproute2}/bin/ip link show host0 2>/dev/null; then
      ${pkgs.iproute2}/bin/ip link set dev host0 name eth1
    fi
  '';

  systemd.services.backdoor.enable = false;

  # we don't have permission to set cpu scheduler in our container
  systemd.services.nix-daemon.serviceConfig.CPUSchedulingPolicy = lib.mkForce "";

  # Disable suid-sgid-wrappers.service as it fails in the nix sandbox
  systemd.services.suid-sgid-wrappers.enable = false;

  # Disable resolvconf as it can cause issues in containers because it cannot apply posix acl
  systemd.services.resolvconf.enable = false;

  # Adds `Include /nix/store/...` to `/etc/ssh/ssh_config`[1] which will make
  # SSH fail when running inside a container test as SSH checks the permissions
  # of the config files it reads which can't be disabled[2] and all the store
  # paths inside the build sandbox (and the container by extension) are owned
  # by `nobody:nogroup` rather than `root:nixbld`.
  # [1]: https://github.com/NixOS/nixpkgs/blob/29335f23bea5e34228349ea739f31ee79e267b88/nixos/modules/programs/ssh.nix#L344-L347
  # [2]: https://github.com/openssh/openssh-portable/blob/b5b405fee7f3e79d44e2d2971a4b6b4cc53f112e/readconf.c#L2579-L2587
  programs.ssh.systemd-ssh-proxy.enable = false;
}
