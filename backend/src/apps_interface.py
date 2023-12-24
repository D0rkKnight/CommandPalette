import subprocess
import platform
import json
import os
import src.extract_icon as extract_icon
from src.cmd_types import *


def start_app(app: str):
    if platform.system() == "Windows":
        command = f'start "" "{app}"'
        subprocess.Popen(command, shell=True)
    else:
        raise NotImplementedError


def get_commands():
    commands = []

    commands += get_prog_commands()

    return commands


def get_prog_commands():
    # opens start menu and gets all programs
    if platform.system() == "Windows":
        global_path = os.path.join(
            os.environ["PROGRAMDATA"],
            "Microsoft",
            "Windows",
            "Start Menu",
        )
        local_path = os.path.join(
            os.environ["APPDATA"],
            "Microsoft",
            "Windows",
            "Start Menu",
        )

        print("System Start Menu Contents:")
        shortcuts = list_shortcuts_windows(global_path) + list_shortcuts_windows(
            local_path
        )

        # print(shortcuts)

        # Clear out shortcuts with duplicate names
        names = []
        unique_shortcuts = []
        for shortcut in shortcuts:
            trimmed = shortcut["name"].strip()

            if trimmed in names:
                print("WARNING: Duplicate shortcut name found: " + shortcut["name"])
            else:
                names.append(trimmed)
                unique_shortcuts.append(shortcut)

        for shortcut in unique_shortcuts:
            # Get icon
            try:
                icon = extract_icon.extract_icon(
                    shortcut["path"], extract_icon.IconSize.SMALL
                )
                print(icon)

            except Exception as e:
                print(f"Error extracting icon for {shortcut['name']}: {e}")

        cmds = []
        for shortcut in unique_shortcuts:
            cmds.append(
                Command(
                    title=f"Run: {shortcut['name']}",
                    command=lambda path=shortcut["path"]: start_app(path),
                    description="",
                )
            )

        return cmds
    else:
        raise NotImplementedError


def list_shortcuts_windows(directory):
    out = []

    """
    Recursively lists all shortcuts in the given directory and writes them to a log file.
    """
    if os.path.exists(directory):
        for item in os.listdir(directory):
            full_path = os.path.join(directory, item)
            if os.path.isdir(full_path):
                # Recursively search in directories
                out = out + list_shortcuts_windows(full_path)
            elif item.lower().endswith(".lnk") or item.lower().endswith(".url"):
                name = item[:-4]

                real_path = os.path.realpath(full_path)

                out += [{"name": name, "path": real_path}]

    return out


# Courtesy of https://stackoverflow.com/questions/75040757/how-do-i-list-all-the-installed-applications-using-python, Florian EDEMESSI
# def get_installed_programs():
#     reg = winreg.ConnectRegistry(None, winreg.HKEY_LOCAL_MACHINE)
#     key = winreg.OpenKey(reg, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall")

#     for i in range(winreg.QueryInfoKey(key)[0]):
#         software_key_name = winreg.EnumKey(key, i)
#         software_key = winreg.OpenKey(key, software_key_name)
#         try:
#             software_name = winreg.QueryValueEx(software_key, "DisplayName")[0]
#             try:
#                 # Try to get the executable path (DisplayIcon)
#                 software_path = winreg.QueryValueEx(software_key, "DisplayIcon")[0]
#             except FileNotFoundError:
#                 try:
#                     # If DisplayIcon not found, try InstallLocation
#                     software_path = winreg.QueryValueEx(
#                         software_key, "InstallLocation"
#                     )[0]
#                 except FileNotFoundError:
#                     # If both are not found, set as not available
#                     software_path = "Path not available"

#             print(f"{software_name} - Path: {software_path}")
#         except Exception as e:
#             print(f"Error retrieving information for software index {i}: {e}")
