#!/usr/bin/env bash

# Generate a ULA IPv6 prefix from a string
# Usage: generate_ula_prefix "string" [prefix_length]
generate_ula_prefix() {
    local input="$1"
    local prefix_len="${2:-48}"  # Default to /48
    local hash
    hash=$(echo -n "$input" | sha256sum | awk '{print $1}')
    local global_id="${hash:0:10}"  # 40 bits = 10 hex chars

    # Construct the base ULA prefix (always starts with fd)
    printf "fd%s:%s:%s::/%s\n" "${global_id:0:2}" "${global_id:2:4}" "${global_id:6:4}" "$prefix_len"
}

# Generate a full IPv6 address from a given prefix and string
# Usage: generate_ipv6_address_from_prefix "fdxx:xxxx:xxxx::/48" "string"
generate_ipv6_address_from_prefix() {
    local prefix_cidr="$1"
    local input="$2"

    # Extract address and prefix length
    local base_prefix="${prefix_cidr%%/*}"
    local prefix_len="${prefix_cidr##*/}"
    local host_bits=$((128 - prefix_len))

    # Get the hash and extract the right number of bits
    local hash
    hash=$(echo -n "$input" | sha256sum | awk '{print $1}')

    # Calculate how many hextets (16 bits) we need based on host bits
    local hex_count=$(( (host_bits + 3) / 4 ))  # Calculate required number of hex chars

    # Generate the address suffix from the hash
    local suffix=""
    for ((i = 0; i < hex_count; i+=4)); do
        suffix+="${hash:$((10 + i)):4}"
        [[ $i -lt $((hex_count - 4)) ]] && suffix+=":"  # Add colon if not last hextet
    done

    # Combine with prefix and print the full address
    printf "%s:%s\n" "${base_prefix%%::*}" "$suffix"
}

# Generate a /56 ULA prefix from "my-network":
# generate_ula_prefix "my-network" 56

# Generate an IPv6 address from that prefix and a device name:
# generate_ipv6_address_from_prefix "fdab:1234:5678::/56" "device-002"
