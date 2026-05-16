"""Color utilities using colorama for ANSI terminal output."""
from colorama import Fore, Back, Style, init
init(autoreset=True)

# ── Color shortcuts ───────────────────────────────────────
RED     = Fore.RED
GREEN   = Fore.GREEN
YELLOW  = Fore.YELLOW
BLUE    = Fore.BLUE
CYAN    = Fore.CYAN
MAGENTA = Fore.MAGENTA
WHITE   = Fore.WHITE
GRAY    = Fore.WHITE + Style.DIM
RESET   = Style.RESET_ALL

BOLD_RED    = Fore.RED    + Style.BRIGHT
BOLD_GREEN  = Fore.GREEN  + Style.BRIGHT
BOLD_CYAN   = Fore.CYAN   + Style.BRIGHT
BOLD_YELLOW = Fore.YELLOW + Style.BRIGHT
BOLD_BLUE   = Fore.BLUE   + Style.BRIGHT
BOLD_WHITE  = Fore.WHITE  + Style.BRIGHT

BG_RED    = Back.RED    + Fore.WHITE + Style.BRIGHT
BG_GREEN  = Back.GREEN  + Fore.BLACK + Style.BRIGHT
BG_YELLOW = Back.YELLOW + Fore.BLACK + Style.BRIGHT
BG_BLUE   = Back.BLUE   + Fore.WHITE + Style.BRIGHT

# ── Status line printers ──────────────────────────────────
def print_ok(msg: str) -> None:
    """Print green OK status line."""
    print(f"{BOLD_GREEN}[  OK  ]{RESET} {msg}")

def print_fail(msg: str) -> None:
    """Print red FAIL status line."""
    print(f"{BOLD_RED}[ FAIL ]{RESET} {msg}")

def print_warn(msg: str) -> None:
    """Print yellow WARN status line."""
    print(f"{BOLD_YELLOW}[ WARN ]{RESET} {msg}")

def print_info(msg: str) -> None:
    """Print cyan INFO status line."""
    print(f"{BOLD_CYAN}[ INFO ]{RESET} {msg}")

def print_block(msg: str) -> None:
    """Print red BLOCKED status line with background."""
    print(f"{BG_RED}[BLOCKED]{RESET} {msg}")

def print_allow(msg: str) -> None:
    """Print green ALLOW status line with background."""
    print(f"{BG_GREEN}[ALLOW]{RESET} {msg}")

def print_step(n: int, total: int, msg: str) -> None:
    """Print numbered step line."""
    print(f"\n{BOLD_BLUE}[STEP {n}/{total}]{RESET} {msg}")

def print_result(label: str, value: str,
                 color: str = CYAN) -> None:
    """Print label: value pair."""
    print(f"  {GRAY}{label:<30}{RESET} {color}{value}{RESET}")

def print_header(title: str) -> None:
    """Print section header with divider."""
    width = 60
    print(f"\n{BOLD_CYAN}{'━' * width}{RESET}")
    print(f"{BOLD_WHITE}  {title}{RESET}")
    print(f"{BOLD_CYAN}{'━' * width}{RESET}")

def print_divider() -> None:
    """Print cyan divider line."""
    print(f"{CYAN}{'─' * 60}{RESET}")

def print_sql_block(sql: str) -> None:
    """Print SQL with keyword highlighting."""
    keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY',
                'ORDER BY', 'LIMIT', 'SET', 'INSERT',
                'UPDATE', 'DELETE', 'COUNT', 'JOIN']
    highlighted = sql
    for kw in keywords:
        highlighted = highlighted.replace(
            kw, f"{BOLD_BLUE}{kw}{RESET}")
    print(f"\n{GRAY}── SQL {'─' * 50}{RESET}")
    for line in highlighted.strip().split('\n'):
        print(f"  {line}")
    print(f"{GRAY}── Result {'─' * 47}{RESET}")

def print_api_call(method: str, url: str) -> None:
    """Print colored API call header."""
    method_color = BOLD_GREEN if method == "GET" \
                   else BOLD_YELLOW
    print(f"\n{GRAY}── API Call {'─' * 46}{RESET}")
    print(f"  {method_color}{method}{RESET} "
          f"{CYAN}{url}{RESET}")
    print(f"{GRAY}── Response {'─' * 45}{RESET}")

def colorize_value(value: str) -> str:
    """Return colorized string based on content."""
    v = str(value).strip().lower()
    if v in ('active', 'allow', 'compliant', 'pass',
             'ok', 'true', 'opt_in'):
        return f"{GREEN}{value}{RESET}"
    elif v in ('blocked', 'deny', 'jailbroken', 'fail',
               'false', 'critical', 'opt_out'):
        return f"{RED}{value}{RESET}"
    elif v in ('warn', 'missing_av', 'restricted',
               'medium', 'pending'):
        return f"{YELLOW}{value}{RESET}"
    elif str(value).replace('.','').replace('-','').isdigit():
        return f"{CYAN}{value}{RESET}"
    return value
