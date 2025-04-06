# service: network
# instances: public, home
# roles: server, client, peer, gateway
{ config, ... }:
{
  _class = "clan.service";

  manifest = {
    name = "network";
  };

  roles.client.interface =
    { lib, ... }:
    {
      # Required
      options.timeout = lib.mkOption {
        type = lib.types.int;
      };
    };

  # Coupled server interface
  # Server has the same interface as client
  # A nice way would be to use imports of a let binding
  roles.server.interface = config.roles.client.interface;

  # called once for every client-instance
  # Which means
  # Possibly multiple times per machine. I.e. if a machine has multiple client-instances
  # Possibly multiple times per service. I  .e. if a service is defined in multiple client-instances
  roles.client.perInstance =
    {
      # client.settings
      ...
    }:
    {
      nixosModule = {
        # debug = instanceName + "-client-" + machine.name;
        # roles = machine.roles;
        # inherit settings;
      };
      # services."nestedSsh" = {
      #   # We import ourselves to test infinite services
      #   imports = [ ./module.nix ];
      #   instances."ssh-instance" = {
      #     # roles.client.machines = lib.mapAttrs (_: {}) roles.client.machine { };
      #     # inferred from the parent roles
      #     # roles.client.machines.foo.settings = { fromClient = true;  };
      #   };
      # };
    };
  roles.server.perInstance =
    { ... }:
    {
      nixosModule = {
        # debug = instanceName + "-server-" + machine.name;
        # inherit settings;
      };
      # services."nestedSsh" = {
      #   imports = [ ./module.nix ];
      #   instances."ssh-instance" = {
      #     # inferred from the parent roles
      #     # TODO: how can we check that a nested service doesn't have a 'random' machine that is not defined in the parent service?
      #     roles.client.machines.foo.settings = {
      #       # foo = if machines.roles ? "server" then "something" else null;
      #     };
      #   };
      # };
    };

  # called once for every machine in the whole service
  # Possibly multiple times per service
  # <rolename>.settings
  # { {instanceName}.roles.{roleName}.machines=[]; }
  perMachine =
    {
      # machine
      # { [instanceName] :: { roles { [roleName] :: { machines :: [machineName] :: { settings :: { ... } ; }; }; }; }; }
      # <instanceName>.roles.<roleName>.machines.<machineName>.settings
      ...
    }:
    {
      nixosModule = {
        # debug = "machine-" + machine.name;
        # inherit machine instances;
      };
    };
}
