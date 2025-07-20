---
description = "UEFI with swap partition (systemd-boot)"
---
# UEFI Swap Template

Modern UEFI system with dedicated swap partition (systemd-boot)

### **Disk Overview**

- **Device**: `{{mainDisk}}`

### **Partitions**

1. **EFI System Partition (ESP)**
   - Size: `500M`
   - Filesystem: `vfat`
   - Mount Point: `/boot` (secure `umask=0077`)

2. **Swap Partition**
   - Size: `2G`
   - Type: Linux swap

3. **Root Partition**
   - Size: Remaining disk space
   - Filesystem: `ext4`
   - Mount Point: `/`

### **Notes**

- Works with any UEFI bootloader
- Dedicated swap partition enables hibernation
