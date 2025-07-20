---
description = "Modern Bcachefs filesystem with compression (systemd-boot)"
---
# Bcachefs Template

Next-generation copy-on-write filesystem with built-in compression (systemd-boot)

### Disk Overview

- Device: `{{mainDisk}}`

### Partitions

1. EFI System Partition (ESP)
   - Size: `500M`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

2. Root Partition
   - Size: Remaining disk space (`100%`)
   - Filesystem: `bcachefs`
   - Mount Point: `/`
   - Features: LZ4 fast compression, ZSTD background compression, checksumming

### Notes

- Bcachefs is a modern COW filesystem with advanced features
- Built-in compression saves disk space
- Data integrity through checksumming
- Supports snapshots and subvolumes (not configured by default)
- Requires Linux kernel 6.7+