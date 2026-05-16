"""tmux session and pane management from Python."""
import subprocess
import time

SESSION = "medtrustx-demo"

def create_session() -> bool:
    """Create tmux session with 3-pane layout."""
    result = subprocess.run(
        ['tmux', 'new-session', '-d', '-s', SESSION,
         '-x', '220', '-y', '55'],
        capture_output=True
    )
    if result.returncode != 0:
        return False
    # Split right 40%
    subprocess.run(
        ['tmux', 'split-window', '-h', '-p', '40',
         '-t', f'{SESSION}:0'],
        capture_output=True
    )
    # Split right pane vertically 50%
    subprocess.run(
        ['tmux', 'split-window', '-v', '-p', '50',
         '-t', f'{SESSION}:0.1'],
        capture_output=True
    )
    return True

def send_to_pane(pane: int, command: str) -> None:
    """Send command to specific tmux pane."""
    subprocess.run(
        ['tmux', 'send-keys', '-t',
         f'{SESSION}:0.{pane}', command, 'Enter'],
        capture_output=True
    )

def start_log_pane(redis_password: str) -> None:
    """Start Redis subscriber in pane 1."""
    cmd = (
        f"redis-cli -h localhost -p 6379 "
        f"-a {redis_password} --no-auth-warning "
        f"SUBSCRIBE medtrust:audit:events "
        f"medtrust:zta:alerts medtrust:clinical:alerts "
        f"medtrust:breach:incidents "
        f"medtrust:gateway:threats 2>/dev/null"
    )
    send_to_pane(1, f"echo '─── LIVE EVENT STREAM ───'")
    send_to_pane(1, cmd)

def start_metrics_pane(script_path: str) -> None:
    """Start live metrics loop in pane 2."""
    send_to_pane(2,
        f"echo '─── LIVE METRICS ───'")
    send_to_pane(2,
        f"watch -n 5 python3 {script_path}")

def attach_to_main() -> None:
    """Attach terminal to main pane 0."""
    subprocess.run(
        ['tmux', 'select-pane', '-t',
         f'{SESSION}:0.0'],
        capture_output=True
    )

def kill_session() -> None:
    """Kill tmux session on exit."""
    subprocess.run(
        ['tmux', 'kill-session', '-t', SESSION],
        capture_output=True
    )

def session_exists() -> bool:
    """Check if tmux session already exists."""
    result = subprocess.run(
        ['tmux', 'has-session', '-t', SESSION],
        capture_output=True
    )
    return result.returncode == 0
