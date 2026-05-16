"""Typewriter text animation utilities."""
import sys
import time
from core.colors import CYAN, RESET, GRAY
from config import TYPEWRITER_DELAY, SPEED_MULTIPLIER

def typewriter(text: str, color: str = "",
               newline: bool = True) -> None:
    """Print text character by character."""
    delay = TYPEWRITER_DELAY / SPEED_MULTIPLIER
    if color:
        sys.stdout.write(color)
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        time.sleep(delay)
    if color:
        sys.stdout.write(RESET)
    if newline:
        print()

def typewriter_info(text: str) -> None:
    """Typewriter with info prefix."""
    sys.stdout.write(f"  {GRAY}→ {RESET}")
    typewriter(text)

def stream_lines(lines: list[str],
                 delay: float = 0.4,
                 color: str = "") -> None:
    """Stream lines with delay between each."""
    actual_delay = delay / SPEED_MULTIPLIER
    for line in lines:
        if color:
            print(f"{color}{line}{RESET}")
        else:
            print(line)
        time.sleep(actual_delay)
