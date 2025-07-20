---
description = "Full disk encryption with LUKS (systemd-boot)"
---
# Encrypted Basic Template

Full disk encryption using LUKS (systemd-boot)

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. EFI System Partition (ESP)
   - Size: `500MB`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

2. Encrypted Container (LUKS)
   - Size: Remaining disk space (`100%`)
   - Encryption: LUKS2 with password
   - Contains encrypted swap (4GB) and root partition

### Notes

- Enter password at boot to unlock disk
- Everything except /boot is encrypted
- Swap is also encrypted
