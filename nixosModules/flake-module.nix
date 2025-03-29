{ inputs, self, ... }:
{
  flake.nixosModules = {
    hidden-ssh-announce.imports = [ ./hidden-ssh-announce.nix ];
    bcachefs.imports = [ ./bcachefs.nix ];
    installer.imports = [
      ./installer
      self.nixosModules.hidden-ssh-announce
      self.nixosModules.bcachefs
    ];
    clanCore.imports = [
      inputs.sops-nix.nixosModules.sops
      inputs.nixos-facter-modules.nixosModules.facter
      inputs.disko.nixosModules.default
      inputs.data-mesher.nixosModules.data-mesher
      ./clanCore
      (
        { pkgs, lib, ... }:
        {
          clan.core.clanPkgs = lib.mkDefault self.packages.${pkgs.hostPlatform.system};
        }
      )
    ];
  };
}
