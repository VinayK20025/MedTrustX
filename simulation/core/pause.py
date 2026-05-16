"""ENTER key pause handler for semi-automatic demo flow."""
import sys
from core.colors import BOLD_YELLOW, GRAY, RESET

def pause(next_scene: str = "") -> None:
    """Pause and wait for ENTER keypress."""
    if next_scene:
        msg = f"  Press ENTER to continue → {next_scene}  "
    else:
        msg = "  Press ENTER to continue...  "
    print(f"\n{BOLD_YELLOW}{msg}{RESET}")
    try:
        input()
    except (EOFError, KeyboardInterrupt):
        print(f"\n{GRAY}Demo interrupted.{RESET}")
        sys.exit(0)

def skip_check() -> bool:
    """Non-blocking check if user pressed 's' to skip."""
    # Implementation: read stdin in non-blocking mode
    # Returns True if user typed 's' + ENTER
    import select
    if select.select([sys.stdin], [], [], 0)[0]:
        line = sys.stdin.readline().strip()
        return line.lower() == 's'
    return False
