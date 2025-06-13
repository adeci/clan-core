{
  pkgs,
  nixosLib,
  clan-core,
  ...
}:

nixosLib.runTest (
  { ... }:
  {
    imports = [
      clan-core.modules.nixosVmTest.clanTest
    ];

    hostPkgs = pkgs;

    name = "postgresql";

    clan = {
      directory = ./.;
      modules."@clan/postgresql" = ../../default.nix;
      inventory = {
        machines.machine = { };

        instances = {
          postgresql-test = {
            module.name = "@clan/postgresql";
            roles.default.machines."machine".settings = {
              users.test = { };
              databases.test = {
                create.options.OWNER = "test";
                restore.stopOnRestore = [ "sample-service" ];
              };
            };
          };
        };
      };
    };

    nodes = {
      machine =
        { config, ... }:
        {
          systemd.services.sample-service = {
            wantedBy = [ "multi-user.target" ];
            script = ''
              while true; do
                echo "Hello, world!"
                sleep 5
              done
            '';
          };

          environment.systemPackages = [ config.services.postgresql.package ];
        };
    };

    testScript = ''
      start_all()
      machine.wait_for_unit("postgresql")
      machine.wait_for_unit("sample-service")
      # Create a test table
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -c 'CREATE TABLE test (id serial PRIMARY KEY);' test")

      timestamp_before = int(machine.succeed("systemctl show --property=ExecMainStartTimestampMonotonic sample-service | cut -d= -f2").strip())

      # Create backup file directory
      machine.succeed("mkdir -p /var/backup/postgres/test")

      # Create a test table and do a manual backup
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -d test -c 'INSERT INTO test DEFAULT VALUES;'")
      machine.succeed("runuser -u postgres -- pg_dump test -Fc -c > /var/backup/postgres/test/pg-dump")

      # Drop the table to verify restore works
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -d test -c 'DROP TABLE test;'")

      # Run the post-restore command (the script created by the service)
      machine.succeed("postgres-db-restore-command-test")
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -l >&2")
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -d test -c '\dt' >&2")

      timestamp_after = int(machine.succeed("systemctl show --property=ExecMainStartTimestampMonotonic sample-service | cut -d= -f2").strip())
      assert timestamp_before < timestamp_after, f"{timestamp_before} >= {timestamp_after}: expected sample-service to be restarted after restore"

      # Check that the table is still there
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -d test -c 'SELECT * FROM test;'")
      output = machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql --csv -c \"SELECT datdba::regrole FROM pg_database WHERE datname = 'test'\"")
      owner = output.split("\n")[1]
      assert owner == "test", f"Expected database owner to be 'test', got '{owner}'"

      # check if restore works if the database does not exist
      machine.succeed("runuser -u postgres -- dropdb test")
      machine.succeed("postgres-db-restore-command-test")
      machine.succeed("runuser -u postgres -- /run/current-system/sw/bin/psql -d test -c '\dt' >&2")
    '';
  }
)
