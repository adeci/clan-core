{
  lib,
  ...
}:
{
  options.system.clan.deployment = {
    guestMachines = lib.mkOption {
      type = lib.types.listOf lib.types.str;
      default = [ ];
      description = ''
        List of guest machine names that should be built fresh during this host's deployment.
        This ensures guest VMs always use the latest configuration.

        For microvm instances, use the format "basemachine-instance".
      '';
    };

    microvmGuests = lib.mkOption {
      type = lib.types.attrsOf lib.types.attrs;
      default = { };
      description = ''
        MicroVM guest settings keyed by instance name.
        Used during deployment to build instances with correct parameters.

        Example:
        {
          test_vm_alpha = {
            mem = 4096;
            vcpu = 2;
            hypervisor = "qemu";
          };
        }
      '';
    };

    preBuildDependencies = lib.mkOption {
      type = lib.types.listOf lib.types.package;
      default = [ ];
      description = ''
        Derivations that must be built before this machine's deployment.
        This is used by the microvm service to ensure guest VMs are built first.
      '';
    };
  };

}
