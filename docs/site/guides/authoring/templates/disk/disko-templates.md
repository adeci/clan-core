
## Structure

A disk template consists of exactly two files

- `default.nix`
- `README.md`

```sh
└── single-disk
    ├── default.nix
    └── README.md
```

## `default.nix`

Placeholders are filled with their machine specific options when a template is used for a machine.

The user can choose any valid options from the hardware report.

The file itself is then copied to `machines/{machineName}/disko.nix` and will be automatically loaded by the machine.

`single-disk/default.nix`
```
{
  disko.devices = {
    disk = {
      main = {
        device = "{{mainDisk}}";
        ...
      };
    };
  };
}
```

## Placeholders

Each template must declare the options of its placeholders depending on the hardware-report.

`api/disk.py`
```py
templates: dict[str, dict[str, Callable[[dict[str, Any]], Placeholder]]] = {
    "single-disk": {
        # Placeholders
        "mainDisk": lambda hw_report: Placeholder(
            label="Main disk", options=hw_main_disk_options(hw_report), required=True
        ),
    }
}
```

Introducing new local or global placeholders requires contributing to clan-core `api/disks.py`.

### Predefined placeholders

These placeholders are automatically replaced during template application:

- `{{mainDisk}}`: The selected disk device (e.g., `/dev/sda`, `/dev/nvme0n1`)
    ```nix
    device = "{{mainDisk}}";
    ```

- `{{uuid}}`: A unique identifier for disk naming. Recommended to prevent false boots from hot-plugged devices.
    ```nix
    name = "main-{{uuid}}";
    ```


## README.md

The README file provides the template description and partition layout for the interactive installer.

### Required Format

The README must follow this exact structure for proper parsing:

```markdown
---
description = "Short description shown in template list"
---
# Template Name

Brief description of the template and its use case

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. Partition Name
   - Size: `size_value`
   - Filesystem: `filesystem_type`
   - Mount Point: `mount_point`

2. Second Partition
   - Size: `size_value`
   - Type: `partition_type`

### Notes

- Important information about the template
- Requirements or recommendations
```

### Important Guidelines

- **No Markdown formatting**: Don't use `**bold**` - it's stripped during parsing
- **Exact headers**: Must use `### Disk Overview`, `### Partitions`, `### Notes`
- **Numbered partitions**: Use `1.`, `2.`, etc. for partition entries
- **Consistent indentation**: Use 3 spaces for property sub-items

## Complete Example: Custom Swap Size

Let's create a variant of `uefi-swap` with a larger swap partition:

### 1. Create template directory

```bash
mkdir -p templates/disk/uefi-swap-4g
```

### 2. Create `default.nix`

```nix
{
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = false;
  boot.loader.efi.efiSysMountPoint = "/boot";
  boot.loader.grub.enable = false;
  disko.devices = {
    disk = {
      main = {
        device = "{{mainDisk}}";
        type = "disk";
        content = {
          type = "gpt";
          partitions = {
            ESP = {
              type = "EF00";
              size = "500M";
              priority = 1;
              content = {
                type = "filesystem";
                format = "vfat";
                mountpoint = "/boot";
                mountOptions = [ "umask=0077" ];
              };
            };
            swap = {
              size = "4G";  # Increased from 2G
              content = {
                type = "swap";
                randomEncryption = false;
              };
            };
            root = {
              size = "100%";
              content = {
                type = "filesystem";
                format = "ext4";
                mountpoint = "/";
              };
            };
          };
        };
      };
    };
  };
}
```

### 3. Create `README.md`

```markdown
---
description = "UEFI with 4GB swap partition (systemd-boot)"
---
# UEFI Swap 4G Template

Modern UEFI system with larger swap partition for memory-intensive workloads

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. EFI System Partition (ESP)
   - Size: `500M`
   - Filesystem: `vfat`
   - Mount Point: `/boot`

2. Swap Partition
   - Size: `4G`
   - Type: Linux swap

3. Root Partition
   - Size: Remaining disk space
   - Filesystem: `ext4`
   - Mount Point: `/`

### Notes

- Larger swap enables comfortable hibernation on 4GB RAM systems
- Suitable for memory-intensive applications
```

### 4. Place in your clan repository

Put your template in `templates/disk/` in your clan repository:

```
your-clan-repo/
└── templates/
    └── disk/
        └── uefi-swap-4g/
            ├── default.nix
            └── README.md
```

## Using Templates

Templates can be used in two ways:

1. **Manual**: `clan templates apply disk template-name machine-name`
2. **Interactive**: Automatically shown in the interactive installer

Both methods support:
- **Built-in templates** from clan-core
- **Custom templates** from your clan's `templates/disk/` directory

Local templates take precedence over built-in templates with the same name.