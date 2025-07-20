"""Interactive TUI for clan machine installation."""

import json
import logging
import os
import re
import subprocess
import sys
import tempfile
import termios
import tty
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any, NamedTuple

from clan_lib.dirs import TemplateType, clan_templates
from clan_lib.errors import ClanError

log = logging.getLogger(__name__)

MIN_TERMINAL_WIDTH = 60
MIN_TERMINAL_HEIGHT = 30
DEFAULT_BOX_WIDTH = 60
HEADER_WIDTH = 60
MIN_MENU_LINES = 5
SSH_TIMEOUT = 30


BYTES_PER_KB = 1024
BYTES_PER_MB = 1024**2
BYTES_PER_GB = 1024**3

BOX_CHARS = {
    "tl": "+",
    "tr": "+",
    "bl": "+",
    "br": "+",
    "h": "-",
    "v": "|",
}

ANSI = {
    "green": "\033[32m",
    "cyan": "\033[36m",
    "blue": "\033[34m",
    "red": "\033[31m",
    "yellow": "\033[33m",
    "white": "\033[37m",
    "bold": "\033[1m",
    "reset": "\033[0m",
}


class DiskInfo(NamedTuple):
    name: str
    size: int
    model: str


class Template(NamedTuple):
    name: str
    description: str
    is_local: bool


@dataclass
class InstallConfig:
    machine_name: str
    target_host: str
    disk: str | None = None
    disk_info: DiskInfo | None = None
    template: Template | None = None
    disko_path: str | None = None


def get_template_description(template_path: Path) -> str:
    readme_path = template_path / "README.md"
    if readme_path.exists():
        try:
            for line in readme_path.read_text().splitlines():
                if line.startswith("description = "):
                    return line[14:].strip('"')
        except OSError:
            pass
    return " ".join(word.capitalize() for word in template_path.name.split("-"))


def get_terminal_size() -> tuple[int, int]:
    try:
        size = os.get_terminal_size()
        return size.columns, size.lines
    except OSError:
        return 80, 24


def get_box_width() -> int:
    """Calculate consistent box width based on terminal size."""
    term_width, _ = get_terminal_size()
    return min(DEFAULT_BOX_WIDTH, term_width - 2)


def clear_screen() -> None:
    print("\033[2J\033[H", end="", flush=True)
    print("\033[3J", end="", flush=True)


def print_header(title: str, width: int = HEADER_WIDTH) -> None:
    cyan = ANSI["cyan"]
    reset = ANSI["reset"]
    print(
        f"{cyan}{BOX_CHARS['tl']}{BOX_CHARS['h'] * (width - 2)}{BOX_CHARS['tr']}{reset}"
    )
    print(
        f"{cyan}{BOX_CHARS['v']}{reset} {title.center(width - 4)} {cyan}{BOX_CHARS['v']}{reset}"
    )
    print(
        f"{cyan}{BOX_CHARS['bl']}{BOX_CHARS['h'] * (width - 2)}{BOX_CHARS['br']}{reset}"
    )
    print()


def print_box(
    title: str,
    content: list[str],
    width: int = DEFAULT_BOX_WIDTH,
    color: str | None = None,
) -> None:
    width = get_box_width() if width == DEFAULT_BOX_WIDTH else width

    color_start = ANSI.get(color, "") if color else ""
    color_end = ANSI["reset"] if color else ""

    if title:
        title_with_spaces = f" {title} "
        remaining_dashes = width - 4 - len(title_with_spaces)
        header_line = f"{BOX_CHARS['tl']}{BOX_CHARS['h'] * 2}{title_with_spaces}{BOX_CHARS['h'] * remaining_dashes}{BOX_CHARS['tr']}"
        header = f"{color_start}{header_line}{color_end}"
    else:
        header = f"{color_start}{BOX_CHARS['tl']}{BOX_CHARS['h'] * (width - 2)}{BOX_CHARS['tr']}{color_end}"

    print(header)

    for line in content:
        visible_line = re.sub(r"\033\[[0-9;]*m", "", line)

        if len(visible_line) > width - 4:
            words = line.split()
            current_line = ""
            current_visible = ""

            for word in words:
                word_visible = re.sub(r"\033\[[0-9;]*m", "", word)
                if (
                    len(current_visible)
                    + len(word_visible)
                    + (1 if current_visible else 0)
                    <= width - 4
                ):
                    current_line += (" " if current_line else "") + word
                    current_visible += (" " if current_visible else "") + word_visible
                else:
                    padding = width - 4 - len(current_visible)
                    print(
                        f"{color_start}{BOX_CHARS['v']}{color_end} {current_line}{' ' * padding} {color_start}{BOX_CHARS['v']}{color_end}"
                    )
                    current_line = word
                    current_visible = word_visible

            if current_line:
                padding = width - 4 - len(current_visible)
                print(
                    f"{color_start}{BOX_CHARS['v']}{color_end} {current_line}{' ' * padding} {color_start}{BOX_CHARS['v']}{color_end}"
                )
        else:
            padding = width - 4 - len(visible_line)
            print(
                f"{color_start}{BOX_CHARS['v']}{color_end} {line}{' ' * padding} {color_start}{BOX_CHARS['v']}{color_end}"
            )

    print(
        f"{color_start}{BOX_CHARS['bl']}{BOX_CHARS['h'] * (width - 2)}{BOX_CHARS['br']}{color_end}"
    )


def get_single_char() -> str:
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        return sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)


def select_with_arrow_keys(
    title: str,
    items: list[tuple[Any, str]],
    current_step: int,
    total_steps: int,
    preview_func: Callable | None = None,
    allow_back: bool = True,
    use_box: bool = False,
    box_title: str = "Selection",
    config: InstallConfig | None = None,
    flake_path: Path | None = None,
) -> tuple[Any, bool]:
    if not items:
        msg = "No items available to select. This might happen if no templates are found or accessible."
        raise ClanError(msg)

    selected = next(
        (
            i
            for i, (val, _) in enumerate(items)
            if val not in ("__header__", "__separator__")
        ),
        0,
    )

    preview_mode = False
    preview_scroll = 0
    preview_content: list[str] = []
    preview_height = 0

    def is_selectable(idx: int) -> bool:
        return 0 <= idx < len(items) and items[idx][0] not in (
            "__header__",
            "__separator__",
            "__no_templates__",
        )

    def find_next_selectable(current: int, direction: int) -> int:
        idx = current
        for _ in range(len(items)):
            idx = (idx + direction) % len(items)
            if is_selectable(idx):
                return idx
        return current

    def draw_menu() -> None:
        clear_screen()
        width, height = get_terminal_size()

        if width < MIN_TERMINAL_WIDTH or height < MIN_TERMINAL_HEIGHT:
            box_width = min(width - 2, 58)
            if box_width > 20:
                print("+" + "-" * (box_width - 2) + "+")

                msg1 = f"Terminal: {width}x{height}"
                padding1 = box_width - len(msg1) - 2
                print(f"|{msg1}{' ' * padding1}|")

                msg2 = f"Need: {MIN_TERMINAL_WIDTH}x{MIN_TERMINAL_HEIGHT}"
                padding2 = box_width - len(msg2) - 2
                print(f"|{msg2}{' ' * padding2}|")

                print("|" + " " * (box_width - 2) + "|")

                msg3 = "Please resize terminal"
                padding3 = (box_width - len(msg3) - 2) // 2
                print(
                    f"|{' ' * padding3}{msg3}{' ' * (box_width - len(msg3) - padding3 - 2)}|"
                )

                print("+" + "-" * (box_width - 2) + "+")
            else:
                print(f"Terminal too small: {width}x{height}")
                print(f"Need at least: {MIN_TERMINAL_WIDTH}x{MIN_TERMINAL_HEIGHT}")
            return

        box_width = get_box_width()
        print_header("Clan Interactive Installer", width=box_width)
        print(f"Step {current_step} of {total_steps}: {title}\n")

        lines_used = 5
        controls_lines = 4

        if use_box:
            lines_used += 3

        available_for_menu = height - lines_used - controls_lines
        if preview_func:
            if height <= 30:
                available_lines = 7
            elif height <= 35:
                remaining = height - 15
                available_lines = min(10, remaining // 2)
            else:
                available_lines = 12
        else:
            available_lines = max(MIN_MENU_LINES, available_for_menu)

        def count_item_lines(item_index: int) -> int:
            if item_index >= len(items):
                return 0
            value, desc = items[item_index]

            if value in ("__header__", "__separator__", "__no_templates__"):
                return 1

            if hasattr(value, "name"):
                display_text = f"{value.name}: {desc}"
            else:
                display_text = desc

            first_line_len = get_box_width() - 6
            cont_line_len = get_box_width() - 8

            words = display_text.split()
            lines = 1
            current_line = ""
            is_first_line = True

            for word in words:
                max_len = first_line_len if is_first_line else cont_line_len
                if len(current_line) + len(word) + (1 if current_line else 0) > max_len:
                    if current_line:
                        is_first_line = False
                        lines += 1
                    current_line = word
                else:
                    current_line += (" " if current_line else "") + word

            return lines

        selected_lines = count_item_lines(selected)

        visible_start = selected
        visible_end = selected + 1
        lines_used = selected_lines

        for i in range(selected - 1, -1, -1):
            item_lines = count_item_lines(i)
            if lines_used + item_lines <= available_lines - 2:
                visible_start = i
                lines_used += item_lines
            else:
                break

        for i in range(selected + 1, len(items)):
            item_lines = count_item_lines(i)
            if lines_used + item_lines <= available_lines - 2:
                visible_end = i + 1
                lines_used += item_lines
            else:
                break

        has_selectable_above = any(
            items[i][0] not in ("__header__", "__separator__", "__no_templates__")
            for i in range(visible_start)
        )
        has_selectable_below = any(
            items[i][0] not in ("__header__", "__separator__", "__no_templates__")
            for i in range(visible_end, len(items))
        )

        if use_box:
            actual_box_width = get_box_width()

            box_content: list[str] = []
            lines_added = 0

            if has_selectable_above:
                box_content.append("  ^ (more above)")
                lines_added += 1

            for i in range(visible_start, visible_end):
                value, desc = items[i]
                if value == "__header__":
                    section_width = actual_box_width - 4
                    header_text = desc.strip(" -")
                    padding = (section_width - len(header_text) - 2) // 2
                    section_header = f"{ANSI['white']}{'=' * padding} {header_text} {'=' * (section_width - padding - len(header_text) - 2)}{ANSI['reset']}"
                    box_content.append(section_header)
                elif value == "__separator__":
                    pass
                elif value == "__no_templates__":
                    box_content.append(f"  {desc}")
                elif i == selected:
                    if hasattr(value, "name"):
                        display_text = f"{value.name}: {desc}"
                    else:
                        display_text = desc
                    first_line_len = actual_box_width - 6
                    cont_line_len = actual_box_width - 8

                    words = display_text.split()
                    lines = []
                    current_line = ""
                    is_first_line = True

                    for word in words:
                        max_len = first_line_len if is_first_line else cont_line_len
                        if (
                            len(current_line) + len(word) + (1 if current_line else 0)
                            <= max_len
                        ):
                            current_line += (" " if current_line else "") + word
                        else:
                            if current_line:
                                lines.append(current_line)
                                is_first_line = False
                            current_line = word
                    if current_line:
                        lines.append(current_line)

                    if lines:
                        box_content.append(
                            f"{ANSI['green']}> {lines[0]}{ANSI['reset']}"
                        )
                        for line in lines[1:]:
                            box_content.append(
                                f"{ANSI['green']}    {line}{ANSI['reset']}"
                            )
                else:
                    if hasattr(value, "name"):
                        display_text = f"{value.name}: {desc}"
                    else:
                        display_text = desc
                    first_line_len = actual_box_width - 6
                    cont_line_len = actual_box_width - 8

                    words = display_text.split()
                    lines = []
                    current_line = ""
                    is_first_line = True

                    for word in words:
                        max_len = first_line_len if is_first_line else cont_line_len
                        if (
                            len(current_line) + len(word) + (1 if current_line else 0)
                            <= max_len
                        ):
                            current_line += (" " if current_line else "") + word
                        else:
                            if current_line:
                                lines.append(current_line)
                                is_first_line = False
                            current_line = word
                    if current_line:
                        lines.append(current_line)

                    if lines:
                        box_content.append(f"  {lines[0]}")
                        for line in lines[1:]:
                            box_content.append(f"    {line}")

            if has_selectable_below:
                box_content.append("  v (more below)")

            if not preview_mode:
                width = actual_box_width
                color_start = ANSI["cyan"]
                color_end = ANSI["reset"]

                title_with_spaces = f" {box_title} "
                remaining_equals = width - 4 - len(title_with_spaces)
                header_line = f"+={'=' * 1}{title_with_spaces}{'=' * remaining_equals}+"
                print(f"{color_start}{header_line}{color_end}")

                for line in box_content:
                    visible_line = re.sub(r"\033\[[0-9;]*m", "", line)
                    padding = width - 4 - len(visible_line)
                    print(
                        f"{color_start}|{color_end} {line}{' ' * padding} {color_start}|{color_end}"
                    )

                print(f"{color_start}+{'=' * (width - 2)}+{color_end}")
            else:
                print_box(
                    box_title, box_content, width=DEFAULT_BOX_WIDTH, color="white"
                )
        else:
            has_selectable_above = False
            for i in range(visible_start):
                if items[i][0] not in (
                    "__header__",
                    "__separator__",
                    "__no_templates__",
                ):
                    has_selectable_above = True
                    break
            if has_selectable_above:
                print("  ^ (more above)")

            for i in range(visible_start, visible_end):
                value, desc = items[i]
                if value == "__header__":
                    print(f"\n{ANSI['bold']}{desc}{ANSI['reset']}")
                elif value == "__separator__":
                    print()
                elif i == selected:
                    print(f"{ANSI['green']}> {desc[: width - 4]}{ANSI['reset']}")
                else:
                    print(f"  {desc[: width - 4]}")

            has_selectable_below = False
            for i in range(visible_end, len(items)):
                if items[i][0] not in (
                    "__header__",
                    "__separator__",
                    "__no_templates__",
                ):
                    has_selectable_below = True
                    break
            if has_selectable_below:
                print("  v (more below)")

            print()

        if preview_func and is_selectable(selected):
            if not preview_content and hasattr(items[selected][0], "name"):
                template_item = items[selected][0]
                if config and config.disk_info:
                    preview_content[:] = get_preview_content(
                        template_item.name,
                        config.disk_info.size,
                        is_local=template_item.is_local,
                        flake_path=flake_path,
                        disk_name=config.disk_info.name,
                    )

            remaining_height = (
                height - lines_used - available_lines - controls_lines - 3
            )
            if remaining_height < 4:
                print(
                    f"{ANSI['yellow']}[Preview hidden - resize terminal for more space]{ANSI['reset']}"
                )
            else:
                if height <= 30:
                    preview_height = 7
                elif height <= 35:
                    preview_height = min(remaining_height - 4, 10)
                else:
                    preview_height = min(remaining_height - 4, 12)

                if preview_mode:
                    preview_title = f"Preview - Scrolling ({preview_scroll + 1}-{min(preview_scroll + preview_height, len(preview_content))}/{len(preview_content)}) - TAB to return"
                    border_char = "="
                    border_color = "cyan"
                else:
                    preview_title = "Preview - Press TAB to scroll"
                    border_char = "-"
                    border_color = None

                if border_color:
                    color_start = ANSI.get(border_color, "")
                    color_end = ANSI["reset"]
                else:
                    color_start = color_end = ""

                preview_box_width = get_box_width()

                print()
                print(
                    f"{color_start}+{border_char * 2} {preview_title} {border_char * (preview_box_width - len(preview_title) - 6)}+{color_end}"
                )

                visible_start = preview_scroll
                visible_end = min(preview_scroll + preview_height, len(preview_content))

                for i in range(visible_start, visible_end):
                    line = preview_content[i]
                    visible_line = re.sub(r"\033\[[0-9;]*m", "", line)
                    padding = preview_box_width - 4 - len(visible_line)
                    print(
                        f"{color_start}|{color_end} {line}{' ' * max(0, padding)} {color_start}|{color_end}"
                    )

                for _ in range(visible_end - visible_start, preview_height):
                    print(
                        f"{color_start}|{color_end}{' ' * (preview_box_width - 2)}{color_start}|{color_end}"
                    )

                print(
                    f"{color_start}+{border_char * (preview_box_width - 2)}+{color_end}"
                )

        separator_width = get_box_width()
        print()
        print("-" * separator_width)
        if preview_mode:
            print("Navigate: ^v/jk | TAB: Exit preview | q: Quit")
        else:
            nav_line = "Navigate: ^v/jk | Select: Enter"
            if preview_func and is_selectable(selected):
                nav_line += " | TAB: Preview"
            print(nav_line)

            action_line = "q: Quit"
            if allow_back and current_step > 1:
                action_line = "b: Back | " + action_line
            print(action_line)

    while True:
        draw_menu()
        ch = get_single_char()

        if ch == "\x1b":
            if preview_mode:
                preview_mode = False
                preview_scroll = 0
            elif get_single_char() == "[":
                arrow = get_single_char()
                if arrow == "A":
                    if preview_mode and preview_content:
                        preview_scroll = max(0, preview_scroll - 1)
                    else:
                        selected = find_next_selectable(selected, -1)
                        preview_content.clear()
                        preview_scroll = 0
                elif arrow == "B":
                    if preview_mode and preview_content:
                        max_scroll = max(0, len(preview_content) - preview_height)
                        preview_scroll = min(max_scroll, preview_scroll + 1)
                    else:
                        selected = find_next_selectable(selected, 1)
                        preview_content.clear()
                        preview_scroll = 0
        elif ch == "\t":
            if preview_func and is_selectable(selected) and preview_content:
                preview_mode = not preview_mode
                if not preview_mode:
                    preview_scroll = 0
        elif ch.lower() == "k":
            if preview_mode and preview_content:
                preview_scroll = max(0, preview_scroll - 1)
            else:
                selected = find_next_selectable(selected, -1)
                preview_content.clear()
                preview_scroll = 0
        elif ch.lower() == "j":
            if preview_mode and preview_content:
                max_scroll = max(0, len(preview_content) - preview_height)
                preview_scroll = min(max_scroll, preview_scroll + 1)
            else:
                selected = find_next_selectable(selected, 1)
                preview_content.clear()
                preview_scroll = 0
        elif ch == "\r" and is_selectable(selected) and not preview_mode:
            return items[selected][0], False
        elif ch == "b" and allow_back and current_step > 1 and not preview_mode:
            return None, True
        elif ch.lower() == "q" or ch == "\x03":
            msg = "Installation cancelled by user"
            raise ClanError(msg)


def get_remote_disks(target_host: str) -> list[DiskInfo]:
    if not re.match(r"^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$", target_host):
        msg = f"Invalid target host format: {target_host}"
        raise ClanError(msg)

    cmd = [
        "ssh",
        "-o",
        "ConnectTimeout=10",
        "-o",
        "ServerAliveInterval=5",
        target_host,
        "lsblk",
        "-J",
        "-b",
        "-o",
        "NAME,SIZE,TYPE,MODEL",
    ]

    log.info(f"Connecting to {target_host} to detect disks...")
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=True, timeout=30
        )
        data = json.loads(result.stdout)
    except subprocess.CalledProcessError as e:
        log.error(f"Failed to get disk info: {e}")
        stderr = e.stderr if e.stderr else "No error details available"
        msg = (
            f"Failed to connect to {target_host} or run lsblk. "
            f"Error: {stderr}. "
            "Check SSH access and ensure the target system has lsblk installed."
        )
        raise ClanError(msg) from e
    except subprocess.TimeoutExpired as e:
        msg = (
            f"Connection to {target_host} timed out after 30 seconds. "
            "Check network connectivity and SSH configuration."
        )
        raise ClanError(msg) from e
    except json.JSONDecodeError as e:
        msg = (
            "Failed to parse disk information from the target system. "
            "This might indicate an incompatible version of lsblk."
        )
        raise ClanError(msg) from e

    return [
        DiskInfo(
            name=f"/dev/{device['name']}",
            size=device.get("size", 0),
            model=(device.get("model") or "Unknown").strip(),
        )
        for device in data.get("blockdevices", [])
        if device.get("type") == "disk"
    ]


def format_size(size_bytes: int) -> str:
    size_f = float(size_bytes)
    for unit in ["B", "KB", "MB", "GB", "TB", "PB"]:
        if size_f < BYTES_PER_KB:
            return f"{size_f:.1f}{unit}"
        size_f /= BYTES_PER_KB
    return f"{size_f:.1f}EB"


def extract_partition_info_from_readme(readme_lines: list[str]) -> list[str]:
    """Extract partition information from README, preserving order and details."""
    partitions = []
    current_partition: list[str] = []
    in_partitions = False

    for line in readme_lines:
        if "### Partitions" in line or "### **Partitions**" in line:
            in_partitions = True
            continue
        if in_partitions:
            # Stop at next section or notes
            if line.startswith("###"):
                break
            # Process partition entries
            if line.strip():
                # Check if this starts a new numbered partition
                if re.match(r"^\d+\.\s+", line):
                    # Save previous partition if exists
                    if current_partition:
                        partitions.extend(current_partition)
                        current_partition = []
                    # Clean up the line
                    line = re.sub(r"^\d+\.\s+", "", line)  # Remove numbering
                    line = line.replace("**", "")  # Remove bold markers
                current_partition.append(line.strip())
            elif current_partition:  # Empty line after partition info
                partitions.extend(current_partition)
                current_partition = []

    # Don't forget last partition
    if current_partition:
        partitions.extend(current_partition)

    return partitions


def wrap_text(text: str, width: int, indent: str = "") -> list[str]:
    """Wrap text to fit within specified width, preserving ANSI codes."""
    # Strip ANSI codes for length calculation
    visible_text = re.sub(r"\033\[[0-9;]*m", "", text)

    # If text fits, return as is
    if len(visible_text) <= width:
        return [text]

    # Extract ANSI codes and their positions
    ansi_codes = []
    for match in re.finditer(r"\033\[[0-9;]*m", text):
        ansi_codes.append((match.start(), match.group()))

    # Split into words
    words = text.split()
    lines = []
    current_line = ""
    current_visible = ""

    for word in words:
        word_visible = re.sub(r"\033\[[0-9;]*m", "", word)
        if (
            len(current_visible) + len(word_visible) + (1 if current_visible else 0)
            <= width
        ):
            current_line += (" " if current_line else "") + word
            current_visible += (" " if current_visible else "") + word_visible
        else:
            if current_line:
                lines.append(current_line)
            current_line = indent + word
            current_visible = word_visible

    if current_line:
        lines.append(current_line)

    return lines


def get_preview_content(
    template: str,
    disk_size: int,
    is_local: bool = False,
    flake_path: Path | None = None,
    disk_name: str | None = None,
) -> list[str]:
    """Generate preview content as a list of lines for scrollable display."""
    content = []
    size_gb = disk_size / BYTES_PER_GB
    max_width = get_box_width() - 4

    if is_local and flake_path:
        template_dir = flake_path / "templates" / "disk" / template
    else:
        try:
            template_dir = clan_templates(TemplateType.DISK) / template
        except Exception:
            msg = "Failed to locate clan-core disk templates"
            raise ClanError(msg) from None

    section_width = max_width
    title = "Disk Layout"
    padding = (section_width - len(title) - 2) // 2
    section_header = f"{ANSI['red']}{'=' * padding} {title} {'=' * (section_width - padding - len(title) - 2)}{ANSI['reset']}"
    content.append(section_header)
    device_name = disk_name if disk_name else "/dev/sdX"
    content.append(f"Device: {device_name} ({size_gb:.1f}G)")
    content.append("Partitions to be created:")
    content.append("")

    if (readme := template_dir / "README.md").exists():
        try:
            readme_lines = readme.read_text().splitlines()
            partitions = extract_partition_info_from_readme(readme_lines)

            current_partition_name = None
            for line in partitions:
                # Check if this is a partition header (already cleaned by extract_partition_info_from_readme)
                if not line.startswith("- "):
                    # This is a partition name
                    current_partition_name = line
                    wrapped = wrap_text(f"- {line}", max_width - 2, "  ")
                    for i, wrapped_line in enumerate(wrapped):
                        if i == 0:
                            content.append(f"  {wrapped_line}")
                        else:
                            content.append(f"  {wrapped_line}")
                elif line.startswith("- Size:") and current_partition_name:
                    size_match = re.search(r"Size:\s*`?([^`(]+)", line)
                    if size_match and content:
                        content[-1] += f" ({size_match.group(1).strip()})"
        except OSError:
            content.append("  Unable to read partition info")

    content.append("")

    title = "Template Details"
    padding = (section_width - len(title) - 2) // 2
    section_header = f"{ANSI['blue']}{'=' * padding} {title} {'=' * (section_width - padding - len(title) - 2)}{ANSI['reset']}"
    content.append(section_header)

    if (readme := template_dir / "README.md").exists():
        try:
            readme_lines = readme.read_text().splitlines()
            in_partitions = False
            in_notes = False
            details_added = False

            for line in readme_lines:
                if "### Partitions" in line or "### **Partitions**" in line:
                    in_partitions = True
                    in_notes = False
                    continue
                if "### Notes" in line or "### **Notes**" in line:
                    in_notes = True
                    in_partitions = False
                    continue
                if line.startswith("###"):
                    in_partitions = False
                    in_notes = False
                    continue

                if in_partitions and line.strip():
                    line = line.replace("**", "")
                    wrapped = wrap_text(line.strip(), max_width)
                    content.extend(wrapped)
                    details_added = True

            if not details_added:
                content.append("No additional template information available")
        except OSError:
            content.append("Unable to read template details")

    if (readme := template_dir / "README.md").exists():
        try:
            readme_lines = readme.read_text().splitlines()
            notes_content = []
            in_notes = False

            for line in readme_lines:
                if "### Notes" in line or "### **Notes**" in line:
                    in_notes = True
                    continue
                if line.startswith("###"):
                    in_notes = False
                    continue
                if in_notes and line.strip():
                    line = line.replace("**", "")
                    wrapped = wrap_text(line.strip(), max_width)
                    notes_content.extend(wrapped)

            if notes_content:
                content.append("")
                title = "Notes"
                padding = (section_width - len(title) - 2) // 2
                section_header = f"{ANSI['yellow']}{'=' * padding} {title} {'=' * (section_width - padding - len(title) - 2)}{ANSI['reset']}"
                content.append(section_header)
                for note in notes_content:
                    content.append(note)
        except OSError:
            pass

    return content


def show_partition_preview(
    template: str,
    disk_size: int,
    is_local: bool = False,
    flake_path: Path | None = None,
    disk_name: str | None = None,
) -> None:
    size_gb = disk_size / BYTES_PER_GB

    if is_local and flake_path:
        template_dir = flake_path / "templates" / "disk" / template
    else:
        try:
            template_dir = clan_templates(TemplateType.DISK) / template
        except Exception:
            msg = "Failed to locate clan-core disk templates"
            raise ClanError(msg) from None

    device_name = disk_name if disk_name else "/dev/sdX"
    disk_info = [
        f"Device: {device_name} ({size_gb:.1f}G)",
        "Partitions to be created:",
        "",
    ]

    if (readme := template_dir / "README.md").exists():
        try:
            readme_lines = readme.read_text().splitlines()
            partitions = extract_partition_info_from_readme(readme_lines)

            for _i, line in enumerate(partitions):
                if any(
                    keyword in line for keyword in ["Partition", "ESP", "Swap", "Root"]
                ):
                    disk_info.append(f"  - {line}")
                elif line.startswith("- Size:"):
                    size_match = re.search(r"Size:\s*`?([^`(]+)", line)
                    if size_match and disk_info:
                        disk_info[-1] += f" ({size_match.group(1).strip()})"
        except OSError:
            disk_info.append("  Unable to read partition info")

    print_box("Disk Layout", disk_info, width=DEFAULT_BOX_WIDTH, color="red")
    print()

    readme_content = []
    notes_content = []

    if (readme := template_dir / "README.md").exists():
        try:
            readme_lines = readme.read_text().splitlines()
        except OSError:
            readme_lines = []

        in_partitions = False
        in_notes = False

        for line in readme_lines:
            if "### Partitions" in line or "### **Partitions**" in line:
                in_partitions = True
                in_notes = False
                continue
            if "### Notes" in line or "### **Notes**" in line:
                in_notes = True
                in_partitions = False
                continue
            if line.startswith("###"):
                in_partitions = False
                in_notes = False
                continue

            if in_partitions and line.strip():
                line = line.replace("**", "")
                readme_content.append(line.strip())
            elif in_notes and line.strip():
                line = line.replace("**", "")
                notes_content.append(line.strip())

    if not readme_content:
        readme_content = ["No additional template information available"]

    print_box("Template Details", readme_content, width=DEFAULT_BOX_WIDTH, color="blue")

    if notes_content:
        print()
        print_box("Notes", notes_content, width=DEFAULT_BOX_WIDTH, color="yellow")


def confirm_installation(config: InstallConfig) -> bool:
    clear_screen()
    width, height = get_terminal_size()

    if width < MIN_TERMINAL_WIDTH or height < MIN_TERMINAL_HEIGHT:
        print(f"{ANSI['red']}! Terminal too small: {width}x{height}{ANSI['reset']}")
        print(
            f"{ANSI['red']}  Need at least: {MIN_TERMINAL_WIDTH}x{MIN_TERMINAL_HEIGHT}{ANSI['reset']}"
        )
        print()

    print_header("Installation Summary", width=min(width - 2, HEADER_WIDTH))

    disk_info = "Unknown"
    if config.disk_info:
        disk_info = f"{config.disk_info.name} - {format_size(config.disk_info.size)} {config.disk_info.model}"

    summary = [
        f"{ANSI['cyan']}Machine:{ANSI['reset']}   {config.machine_name}",
        f"{ANSI['cyan']}Disk:{ANSI['reset']}      {disk_info}",
        f"{ANSI['cyan']}Template:{ANSI['reset']}  {config.template.name if config.template else 'Unknown'}",
    ]

    print_box("Configuration", summary, width=DEFAULT_BOX_WIDTH)
    print()

    warning = [
        "This will COMPLETELY ERASE all data on the selected disk!",
        "This action cannot be undone!",
    ]
    print_box("WARNING", warning, width=DEFAULT_BOX_WIDTH, color="red")

    print("\n" + "-" * DEFAULT_BOX_WIDTH)
    print("Enter 'yes' to continue, 'b' to go back, or 'q' to quit")

    while True:
        response = input("> ").strip().lower()
        if response == "yes":
            return True
        if response == "b":
            return False
        if response in ("q", "quit", "exit"):
            msg = "Installation cancelled by user"
            raise ClanError(msg)
        print("Please enter 'yes', 'b', or 'q'")


def apply_disk_template(
    machine_name: str,
    flake_path: Path,
    template: str,
    is_local: bool,
    disk: str,
) -> Path:
    if not re.match(r"^[a-zA-Z0-9_-]+$", machine_name):
        msg = f"Invalid machine name: {machine_name}"
        raise ClanError(msg)

    if not re.match(r"^/dev/[a-zA-Z0-9/_-]+$", disk):
        msg = f"Invalid disk device: {disk}"
        raise ClanError(msg)
    if is_local:
        template_path = flake_path / "templates" / "disk" / template / "default.nix"
    else:
        try:
            template_path = clan_templates(TemplateType.DISK) / template / "default.nix"
        except Exception as e:
            msg = f"Failed to locate clan-core disk templates: {e}"
            raise ClanError(msg) from e

    if not template_path.exists():
        msg = f"Template not found: {template_path}"
        raise ClanError(msg)

    try:
        content = template_path.read_text()
    except OSError as e:
        msg = f"Failed to read template: {e}"
        raise ClanError(msg) from e

    escaped_disk = disk.replace('"', '\\"')
    content = content.replace("{{mainDisk}}", escaped_disk)

    # Custom replacements (matching disk.py behavior)
    from uuid import uuid4

    content = content.replace("{{uuid}}", str(uuid4()).replace("-", ""))

    machine_dir = flake_path / "machines" / machine_name
    machine_dir.mkdir(parents=True, exist_ok=True)

    disko_path = machine_dir / "disko.nix"

    try:
        with tempfile.NamedTemporaryFile(
            mode="w", dir=machine_dir, prefix=".disko.", suffix=".tmp", delete=False
        ) as tmp:
            tmp.write(content)
            tmp.flush()
            os.fsync(tmp.fileno())

        Path(tmp.name).replace(disko_path)
    except OSError as e:
        msg = f"Failed to write disk configuration: {e}"
        raise ClanError(msg) from e

    log.info(f"Generated disko.nix at {disko_path}")
    return disko_path


def show_welcome_screen() -> None:
    """Display welcome screen with ASCII art logo."""
    clear_screen()
    width, _ = get_terminal_size()

    logo = [
        "     ________    ___    _   __",
        "    / ____/ /   /   |  / | / /",
        "   / /   / /   / /| | /  |/ / ",
        " _/ /___/ /___/ ___ |/ /|  /  ",
        "(_)____/_____/_/  |_/_/ |_/   ",
        "                              ",
    ]

    print()
    print()
    for line in logo:
        padding = (width - len(line)) // 2
        print(f"{' ' * padding}{ANSI['cyan']}{line}{ANSI['reset']}")

    print()
    print()

    title = "Interactive Installer"
    title_padding = (width - len(title)) // 2
    print(f"{' ' * title_padding}{ANSI['bold']}{title}{ANSI['reset']}")

    print()
    print()

    prompt = "Press Enter to continue..."
    prompt_padding = (width - len(prompt)) // 2
    print(f"{' ' * prompt_padding}{prompt}")

    input()


def interactive_install_config(
    machine_name: str, target_host: str, flake_path: Path
) -> dict[str, Any]:
    show_welcome_screen()

    current_step = 1
    total_steps = 3
    config = InstallConfig(
        machine_name=machine_name,
        target_host=target_host,
    )

    while current_step <= total_steps:
        try:
            if current_step == 1:
                disks = get_remote_disks(target_host)
                if not disks:
                    msg = (
                        f"No disks found on {target_host}. "
                        "Please check: 1) The target system is running, "
                        "2) SSH access is working, 3) The target has block devices"
                    )
                    raise ClanError(msg)

                disk_items = [
                    (
                        disk,
                        f"{disk.name} - {format_size(disk.size)} ({disk.model})",
                    )
                    for disk in disks
                ]

                selected, go_back = select_with_arrow_keys(
                    "Select Installation Disk",
                    disk_items,
                    current_step,
                    total_steps,
                    allow_back=False,
                    use_box=True,
                    box_title="Available Disks",
                    config=config,
                    flake_path=flake_path,
                )

                if not go_back:
                    config.disk = selected.name
                    config.disk_info = selected
                    current_step += 1

            elif current_step == 2:
                menu_items: list[tuple[Any, str]] = []

                try:
                    clan_disk_templates = clan_templates(TemplateType.DISK)
                except Exception:
                    clan_disk_templates = None

                for source, label, is_local in [
                    (
                        clan_disk_templates,
                        "-- Clan-core built-in templates --",
                        False,
                    ),
                    (flake_path / "templates" / "disk", "-- Local templates --", True),
                ]:
                    if menu_items:
                        menu_items.append(("__separator__", ""))
                    menu_items.append(("__header__", label))

                    if source and source.exists() and any(source.iterdir()):
                        for template_dir in sorted(source.iterdir()):
                            if (
                                template_dir.is_dir()
                                and (template_dir / "default.nix").exists()
                            ):
                                template = Template(
                                    name=template_dir.name,
                                    description=get_template_description(template_dir),
                                    is_local=is_local,
                                )
                                menu_items.append((template, template.description))
                    else:
                        menu_items.append(("__no_templates__", "  None"))

                if not config.disk_info:
                    msg = "No disk selected"
                    raise ClanError(msg)

                def preview(item: Any) -> None:
                    if isinstance(item, Template) and config.disk_info:
                        show_partition_preview(
                            item.name,
                            config.disk_info.size,
                            is_local=item.is_local,
                            flake_path=flake_path,
                        )

                selected, go_back = select_with_arrow_keys(
                    "Select Partition Layout",
                    menu_items,
                    current_step,
                    total_steps,
                    preview_func=preview,
                    use_box=True,
                    box_title="Templates",
                    config=config,
                    flake_path=flake_path,
                )

                if go_back:
                    current_step -= 1
                else:
                    config.template = selected

                    current_step += 1

            elif current_step == 3:
                if confirm_installation(config):
                    clear_screen()
                    print_header("Generating Configuration")
                    print("Creating disk configuration...")

                    if not config.template or not config.disk:
                        msg = "Template or disk not selected"
                        raise ClanError(msg)

                    disko_path = apply_disk_template(
                        machine_name,
                        flake_path,
                        config.template.name,
                        config.template.is_local,
                        config.disk,
                    )

                    config.disko_path = str(disko_path)
                    print(
                        f"\n{ANSI['green']}[OK]{ANSI['reset']} Generated {disko_path}"
                    )

                    import subprocess

                    try:
                        result = subprocess.run(
                            ["git", "ls-files", "--error-unmatch", str(disko_path)],
                            cwd=flake_path,
                            capture_output=True,
                            check=False,
                        )
                        if result.returncode != 0:
                            print(
                                f"\n{ANSI['yellow']}[!] Important:{ANSI['reset']} The generated disko.nix must be tracked by git for the build to work."
                            )
                            print(
                                "    Nix flakes only see files that are tracked by git."
                            )
                            print("\n    Option 1: Add to git now (recommended)")
                            print(
                                f"    Option 2: Run manually: git add {disko_path.relative_to(flake_path)}"
                            )
                            print(
                                "    Option 3: Set CLAN_NO_COMMIT=1 to skip this check\n"
                            )

                            response = input("Add to git now? [Y/n]: ").strip().lower()
                            if response != "n":
                                subprocess.run(
                                    ["git", "add", str(disko_path)],
                                    cwd=flake_path,
                                    check=True,
                                )
                                print(
                                    f"{ANSI['green']}[OK]{ANSI['reset']} Added to git"
                                )
                            else:
                                print(
                                    f"\n{ANSI['red']}[!] Warning:{ANSI['reset']} Installation will fail without adding the file to git!"
                                )
                                print(
                                    "    Please add it manually before the build starts."
                                )
                                input("\nPress Enter to continue anyway...")
                    except Exception as e:
                        print(
                            f"\n{ANSI['yellow']}[!] Warning:{ANSI['reset']} Could not check git status: {e}"
                        )

                    print("\nProceeding with installation...")
                    print("-" * 60 + "\n")
                    return {
                        "machine_name": config.machine_name,
                        "target_host": config.target_host,
                        "disk": config.disk,
                        "disk_info": {
                            "name": config.disk_info.name,
                            "size": config.disk_info.size,
                            "model": config.disk_info.model,
                        }
                        if config.disk_info
                        else None,
                        "template": config.template.name if config.template else None,
                        "disko_path": config.disko_path,
                    }
                current_step -= 1

        except KeyboardInterrupt as e:
            msg = "Installation cancelled by user"
            raise ClanError(msg) from e

    return {}
