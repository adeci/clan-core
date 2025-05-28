"""
Password prompt utilities for SSH and sudo operations.

This module provides functions to create password prompts using either
GUI (zenity) or terminal (dialog) interfaces based on the environment.
"""

import os
import sys

from clan_lib.nix import nix_shell


def get_password_command(title: str = "SSH Password", message: str = "") -> list[str]:
    """
    Determine the appropriate password prompt command based on environment.

    This function checks if a GUI environment is available and selects either zenity (for GUI)
    or dialog (for terminal) to create a password prompt. It then returns a command that will
    execute the selected tool within a Nix shell with the necessary dependencies.

    Args:
        title: Title for the password dialog
        message: Optional message for the dialog (only used by dialog, not zenity)

    Returns:
        A list of strings representing the shell command to execute the password prompt
    """
    if (
        os.environ.get("DISPLAY")
        or os.environ.get("WAYLAND_DISPLAY")
        or sys.platform == "darwin"
    ):
        # GUI environment - use zenity
        cmd = ["zenity", "--password", "--title", title]
        dependencies = ["zenity"]
    else:
        # Terminal environment - use dialog
        cmd = [
            "dialog",
            "--stdout",
            "--insecure",
            "--title",
            title,
            "--passwordbox",
            message or "Enter password:",
            "10",
            "50",
        ]
        dependencies = ["dialog"]
    return nix_shell(dependencies, cmd)
