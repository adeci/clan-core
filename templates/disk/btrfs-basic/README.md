---
description = "Modern Btrfs filesystem with snapshots (systemd-boot)"
---
# Btrfs Basic Template

Copy-on-write filesystem with automatic compression (systemd-boot)

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. EFI System Partition (ESP)
   - Size: `500MB`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

2. Btrfs Root Partition
   - Size: Remaining disk space (`100%`)
   - Filesystem: `btrfs` with zstd compression
   - Subvolumes: @, @home, @nix, @swap for system organization

### Notes

- Built-in compression reduces writes
- Swap is a file on btrfs subvolume
