---
description = "BIOS & UEFI compatible (GRUB bootloader)"
---
# BIOS-UEFI Template

Universal disk layout that works on both BIOS and UEFI (GRUB)

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. BIOS Boot Partition
   - Size: `1MB`
   - Type: BIOS boot (for GRUB on BIOS systems)
   - Not visible after installation

2. EFI System Partition (ESP)
   - Size: `500MB`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

3. Root Partition
   - Size: Remaining disk space (`100%`)
   - Filesystem: `ext4`
   - Mount Point: `/`

### Notes

- Requires GRUB bootloader (supports both BIOS & UEFI)
- Works on older hardware
