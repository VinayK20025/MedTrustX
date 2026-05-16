"""Progress bars and spinner animations."""
import sys
import time
import threading
from core.colors import *
from config import SPEED_MULTIPLIER

def progress_bar(label: str, duration: float,
                 width: int = 40,
                 color: str = GREEN) -> None:
    """Animated progress bar from 0% to 100%."""
    actual = duration / SPEED_MULTIPLIER
    steps = 50
    step_time = actual / steps
    for i in range(steps + 1):
        pct = i * 2
        filled = int(width * i / steps)
        bar = '█' * filled + '░' * (width - filled)
        bar_color = GREEN if pct < 60 \
            else YELLOW if pct < 80 else RED
        sys.stdout.write(
            f"\r  {GRAY}{label:<35}{RESET} "
            f"{bar_color}[{bar}]{RESET} "
            f"{BOLD_WHITE}{pct:3d}%{RESET}"
        )
        sys.stdout.flush()
        time.sleep(step_time)
    print()

def spinner(label: str, duration: float) -> None:
    """Rotating spinner animation."""
    frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']
    actual = duration / SPEED_MULTIPLIER
    end_time = time.time() + actual
    i = 0
    while time.time() < end_time:
        sys.stdout.write(
            f"\r  {CYAN}{frames[i % len(frames)]}{RESET} "
            f"{GRAY}{label}{RESET}   "
        )
        sys.stdout.flush()
        time.sleep(0.1)
        i += 1
    sys.stdout.write(f"\r  {GREEN}✓{RESET} "
                     f"{GRAY}{label}{RESET}   \n")
    sys.stdout.flush()

def count_up(label: str, target: int,
             duration: float = 1.5) -> None:
    """Animated count-up from 0 to target."""
    actual = duration / SPEED_MULTIPLIER
    steps = min(target, 60)
    step_time = actual / steps if steps > 0 else 0
    for i in range(steps + 1):
        current = int(target * i / steps) if steps > 0 \
                  else target
        sys.stdout.write(
            f"\r  {GRAY}{label:<30}{RESET} "
            f"{CYAN}{current:>8,}{RESET}"
        )
        sys.stdout.flush()
        time.sleep(step_time)
    # Final value
    sys.stdout.write(
        f"\r  {GRAY}{label:<30}{RESET} "
        f"{BOLD_GREEN}{target:>8,}{RESET}\n"
    )
    sys.stdout.flush()

def draw_bar_chart(data: list[tuple[str, int]],
                   max_width: int = 40,
                   color: str = CYAN) -> None:
    """Draw horizontal ASCII bar chart.
    data: list of (label, value) tuples."""
    if not data:
        return
    max_val = max(v for _, v in data) or 1
    for label, value in data:
        bar_len = int(max_width * value / max_val)
        bar = '█' * bar_len
        bar_color = GREEN if value < max_val * 0.5 \
            else YELLOW if value < max_val * 0.8 else RED
        print(f"  {GRAY}{label:<20}{RESET} "
              f"{bar_color}{bar:<{max_width}}{RESET} "
              f"{CYAN}{value:,}{RESET}")

def draw_risk_meter(score: float, label: str = "") -> None:
    """Draw colored risk score meter 0.0–1.0."""
    width = 30
    filled = int(width * score)
    color = GREEN if score < 0.33 \
        else YELLOW if score < 0.66 else RED
    bar = '█' * filled + '░' * (width - filled)
    risk_label = 'LOW' if score < 0.33 \
        else 'MEDIUM' if score < 0.66 else 'HIGH'
    print(f"\n  {GRAY}Risk Score{RESET} "
          f"{color}{score:.2f}{RESET} "
          f"{color}[{risk_label}]{RESET}")
    print(f"  {color}[{bar}]{RESET} "
          f"{GRAY}{int(score*100)}%{RESET}")
    if label:
        print(f"  {GRAY}{label}{RESET}\n")

def draw_trust_meter(score: float) -> None:
    """Draw colored trust score meter 0.0–10.0."""
    width = 30
    normalized = score / 10.0
    filled = int(width * normalized)
    color = RED if score < 3.0 \
        else YELLOW if score < 6.1 \
        else CYAN if score < 8.6 else BOLD_GREEN
    level = 'BLOCKED' if score < 3.0 \
        else 'RESTRICTED' if score < 6.1 \
        else 'STANDARD' if score < 8.6 else 'TRUSTED'
    bar = '█' * filled + '░' * (width - filled)
    print(f"\n  {GRAY}Trust Score{RESET} "
          f"{color}{score:.2f}/10.0{RESET} "
          f"{color}[{level}]{RESET}")
    print(f"  {color}[{bar}]{RESET}\n")
