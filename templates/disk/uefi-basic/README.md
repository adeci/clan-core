---
description = "Basic UEFI setup with systemd-boot"
---
# UEFI Basic Template

Minimal disk layout for modern UEFI systems (systemd-boot)

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. EFI System Partition (ESP)
   - Size: `500MB`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

2. Root Partition
   - Size: Remaining disk space (`100%`)
   - Filesystem: `ext4`
   - Mount Point: `/`

### Notes

- Works with any UEFI bootloader
- No swap partition
