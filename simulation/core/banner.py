"""ASCII art banners and panel display functions."""
import os
from datetime import datetime
from core.colors import *

MEDTRUSTX_LOGO = """
███╗   ███╗███████╗██████╗ ████████╗██████╗ ██╗   ██╗███████╗████████╗██╗  ██╗
████╗ ████║██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝╚██╗██╔╝
██╔████╔██║█████╗  ██║  ██║   ██║   ██████╔╝██║   ██║███████╗   ██║    ╚███╔╝
██║╚██╔╝██║██╔══╝  ██║  ██║   ██║   ██╔══██╗██║   ██║╚════██║   ██║    ██╔██╗
██║ ╚═╝ ██║███████╗██████╔╝   ██║   ██║  ██║╚██████╔╝███████║   ██║   ██╔╝ ██╗
╚═╝     ╚═╝╚══════╝╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝
"""

def show_main_banner() -> None:
    """Display MedTrustX main ASCII logo."""
    os.system('clear')
    print(f"{BOLD_CYAN}{MEDTRUSTX_LOGO}{RESET}")
    print(f"{WHITE}  Digital Hospital Operating System"
          f" — Security Research Presentation{RESET}")
    print(f"{GRAY}  MedTrustX DHOS v2.0 | "
          f"Production Architecture Demo | "
          f"{datetime.now().strftime('%B %d, %Y %H:%M')}{RESET}")
    print(f"{BOLD_CYAN}{'═' * 80}{RESET}\n")

def show_act_banner(act_num: int, act_name: str,
                    module_name: str) -> None:
    """Display act header panel."""
    os.system('clear')
    width = 54
    print(f"\n{BOLD_CYAN}╔{'═' * width}╗{RESET}")
    print(f"{BOLD_CYAN}║{RESET}  "
          f"{BOLD_WHITE}ACT {act_num} — {act_name:<{width-10}}"
          f"{RESET}{BOLD_CYAN}  ║{RESET}")
    print(f"{BOLD_CYAN}║{RESET}  "
          f"{CYAN}Module: {module_name:<{width-10}}"
          f"{RESET}{BOLD_CYAN}  ║{RESET}")
    print(f"{BOLD_CYAN}╚{'═' * width}╝{RESET}\n")

def show_scene_banner(scene_num: int, scene_name: str) -> None:
    """Display scene header."""
    width = 45
    print(f"\n{BLUE}┌{'─' * width}┐{RESET}")
    print(f"{BLUE}│{RESET}  "
          f"{BOLD_WHITE}Scene {scene_num}: {scene_name:<{width-11}}"
          f"{RESET}{BLUE}  │{RESET}")
    print(f"{BLUE}└{'─' * width}┘{RESET}\n")

def show_pass_banner() -> None:
    """Display large green PASSED banner."""
    print(f"\n{BG_GREEN}")
    print(f"  ✓  ALL CHECKS PASSED  ✓  ")
    print(f"{RESET}\n")

def show_blocked_banner() -> None:
    """Display large red BLOCKED banner."""
    print(f"\n{BG_RED}")
    print(f"  ✗  ACCESS BLOCKED  ✗  ")
    print(f"{RESET}\n")

def show_alert_banner() -> None:
    """Display yellow ALERT banner."""
    print(f"\n{BG_YELLOW}")
    print(f"  ⚠  SECURITY ALERT  ⚠  ")
    print(f"{RESET}\n")

def show_patient_card(data: dict) -> None:
    """Display formatted patient card."""
    width = 50
    print(f"\n{CYAN}┌─── Patient Record "
          f"{'─' * (width - 19)}┐{RESET}")
    fields = [
        ("MRN",     data.get('mrn', 'N/A')),
        ("Name",    f"{data.get('first_name','')} "
                    f"{data.get('last_name','')}"),
        ("DOB",     data.get('date_of_birth', 'N/A')),
        ("Gender",  data.get('gender', 'N/A')),
        ("Status",  data.get('status', 'N/A')),
        ("Tenant",  data.get('tenant_id', 'N/A')),
    ]
    for label, value in fields:
        colored_val = colorize_value(str(value))
        print(f"{CYAN}│{RESET}  "
              f"{GRAY}{label:<10}{RESET} "
              f"{colored_val:<{width-12}}"
              f"{CYAN}│{RESET}")
    print(f"{CYAN}└{'─' * (width)}┘{RESET}\n")
