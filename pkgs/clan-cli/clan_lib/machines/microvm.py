"""MicroVM-specific functionality for clan machines deployment."""

import json
import logging
import os
from typing import Any

from clan_lib.cmd import RunOpts, run
from clan_lib.nix import nix_command
from clan_lib.ssh.remote import Remote

log = logging.getLogger(__name__)


def is_microvm_instance(guest_name: str) -> bool:
    """Check if a guest name represents a microvm instance (contains :: delimiter)."""
    return "::" in guest_name


def parse_instance_name(guest_name: str) -> tuple[str, str]:
    """Parse a microvm instance name into base machine and instance name.

    Expected format: {base-machine}::{instance-name}
    The :: delimiter separates the base machine from the instance name.
    """
    if not is_microvm_instance(guest_name):
        msg = f"{guest_name} is not a microvm instance name"
        raise ValueError(msg)
    # Split at :: delimiter
    parts = guest_name.split("::", 1)
    if len(parts) != 2:
        msg = f"Invalid microvm instance name format: {guest_name}"
        raise ValueError(msg)
    return parts[0], parts[1]


def build_microvm_instance(
    machine: Any,  # Machine type
    guest_name: str,
    microvm_settings: dict[str, Any],
) -> str:
    """Build a microvm instance with overlay configuration.

    Args:
        machine: The host machine object
        guest_name: Full guest name (base-instance)
        microvm_settings: Instance-specific settings (mem, vcpu, etc.)

    Returns:
        Path to the built microvm runner
    """
    base_machine, instance_name = parse_instance_name(guest_name)

    log.info(
        f"Building microvm instance (base: {base_machine})",
        extra={"command_prefix": instance_name},
    )
    log.info(
        f"Settings: mem={microvm_settings.get('mem')}MB, vcpu={microvm_settings.get('vcpu')}, hypervisor={microvm_settings.get('hypervisor')}",
        extra={"command_prefix": instance_name},
    )

    # Build the instance configuration with overlay
    build_cmd = nix_command(
        [
            "build",
            "--impure",
            "--no-link",
            "--print-out-paths",
            "--expr",
            _generate_microvm_nix_expr(
                machine, base_machine, instance_name, microvm_settings
            ),
        ]
    )

    log.info("Running build command...", extra={"command_prefix": instance_name})
    result = run(
        build_cmd,
        RunOpts(
            needs_user_terminal=True,
            error_msg=f"Failed to build guest machine {guest_name}",
            prefix=instance_name,
        ),
    )

    runner_path = result.stdout.strip()
    log.info(f"✓ Built runner: {runner_path}", extra={"command_prefix": instance_name})

    return runner_path


def _generate_microvm_nix_expr(
    machine: Any,
    base_machine: str,
    instance_name: str,
    microvm_settings: dict[str, Any],
) -> str:
    """Generate the Nix expression for building a microvm instance."""
    return f"""
let
  flake = builtins.getFlake "{machine.flake.identifier}";
  baseMachine = flake.nixosConfigurations.{base_machine};
  nixpkgs = flake.inputs.nixpkgs;

  # Build instance configuration with overlay
  instanceConfig = nixpkgs.lib.nixosSystem {{
    system = baseMachine.config.nixpkgs.hostPlatform or baseMachine.config.nixpkgs.system;
    modules = baseMachine._module.args.modules ++ [
      {{
        microvm = {{
          mem = {microvm_settings.get("mem", 1024)};
          vcpu = {microvm_settings.get("vcpu", 1)};
          hypervisor = "{microvm_settings.get("hypervisor", "qemu")}";

          # Add virtiofs share for sops age key
          shares = [
            {{
              source = "/var/lib/microvms/{instance_name}/sops";
              mountPoint = "/var/lib/sops-nix";
              tag = "sops-age-key";
              proto = "virtiofs";
            }}
          ];
        }};

        # Configure sops to use the age key from virtiofs mount
        sops = {{
          age.keyFile = "/var/lib/sops-nix/key.txt";
          # Don't generate a new key - we're providing it via virtiofs
          age.generateKey = false;
          # Prevent sops from remounting (helps with virtiofs stability)
          keepGenerations = 0;
        }};
      }}
    ];
    specialArgs = baseMachine._module.specialArgs;
  }};
in
instanceConfig.config.microvm.runner.{microvm_settings.get("hypervisor", "qemu")}
"""


def upload_microvm_runners(
    machine: Any, sudo_host: Remote, microvm_runners: dict[str, str]
) -> None:
    """Upload microvm runner mappings to the host.

    Args:
        machine: The host machine object
        sudo_host: Remote connection with sudo access
        microvm_runners: Mapping of instance names to runner paths
    """
    if not microvm_runners:
        return

    log.info(
        "Uploading microvm runner mappings", extra={"command_prefix": machine.name}
    )

    # Create the directory on the host
    sudo_host.run(["mkdir", "-p", "/var/lib/clan"], RunOpts())

    # Write runner mappings as JSON using echo
    runners_json = json.dumps(microvm_runners, indent=2)
    # Escape for shell
    escaped_json = runners_json.replace("'", "'\"'\"'")

    # Write the file using echo
    sudo_host.run(
        ["bash", "-c", f"echo '{escaped_json}' > /var/lib/clan/microvm-runners.json"],
        RunOpts(error_msg="Failed to write microvm runner mappings"),
    )

    # Set proper permissions
    sudo_host.run(["chmod", "644", "/var/lib/clan/microvm-runners.json"], RunOpts())

    log.info(
        "✓ Uploaded microvm runner mappings", extra={"command_prefix": machine.name}
    )


def copy_runners_to_host(
    machine: Any, host: Remote, sudo_host: Remote, microvm_runners: dict[str, str]
) -> None:
    """Copy microvm runners to the remote host's nix store.

    Args:
        machine: The host machine object
        host: Remote connection for build operations
        sudo_host: Remote connection with sudo access
        microvm_runners: Mapping of instance names to runner paths
    """
    if not microvm_runners or host.target == "localhost":
        return

    log.info(
        f"Copying {len(microvm_runners)} microvm runner(s) to host",
        extra={"command_prefix": machine.name},
    )

    # Construct the remote URL for nix copy
    remote_url = f"ssh-ng://{sudo_host.target}"
    if machine._class_ == "darwin":
        remote_url += "?remote-program=bash -lc 'exec nix-daemon --stdio'"

    # Copy each runner to the remote store
    for instance_name, runner_path in microvm_runners.items():
        log.info(
            f"Copying runner for {instance_name}...",
            extra={"command_prefix": machine.name},
        )
        copy_cmd = nix_command(
            ["copy", "--to", remote_url, "--no-check-sigs", runner_path]
        )

        run(
            copy_cmd,
            RunOpts(
                env=sudo_host.nix_ssh_env(os.environ.copy()),
                needs_user_terminal=True,
                error_msg=f"Failed to copy runner for {instance_name}",
                prefix=machine.name,
            ),
        )
        log.info(
            f"✓ Copied runner for {instance_name}",
            extra={"command_prefix": machine.name},
        )
