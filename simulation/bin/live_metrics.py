"""Live system metrics dashboard loop for tmux pane 2."""
import os
import sys
import time

# Add simulation root to path so we can import modules
sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))

from config import LIVE, DB_CONFIGS
from core.colors import *
from core.display import display_table
from data import db_client as db
from data import api_client as api

def main() -> None:
    """Run continuous metrics loop."""
    try:
        while True:
            os.system('clear')
            print(f"{BOLD_CYAN}{'═'*40}{RESET}")
            print(f"{BOLD_WHITE}  MedTrustX Live Metrics{RESET}")
            print(f"{BOLD_CYAN}{'═'*40}{RESET}\n")

            # DB Latency
            print(f"{BOLD_WHITE}Database Latency:{RESET}")
            for db_key, cfg in DB_CONFIGS.items():
                start = time.time()
                alive = db.test_connection(db_key)
                latency = int((time.time() - start) * 1000)
                if alive:
                    color = GREEN if latency < 20 \
                            else YELLOW
                    print(f"  {GRAY}{cfg['dbname']:<15}{RESET} "
                          f"{color}{latency}ms{RESET}")
                else:
                    print(f"  {GRAY}{cfg['dbname']:<15}{RESET} "
                          f"{RED}ERR{RESET}")

            # Service Health
            print(f"\n{BOLD_WHITE}Service Health:{RESET}")
            svcs = ['kong', 'zta', 'patient', 'ai', 'audit']
            for svc in svcs:
                start = time.time()
                alive = api.health_check(svc)
                latency = int((time.time() - start) * 1000)
                if alive:
                    color = GREEN if latency < 50 \
                            else YELLOW
                    print(f"  {GRAY}{svc:<15}{RESET} "
                          f"{color}UP {latency}ms{RESET}")
                else:
                    print(f"  {GRAY}{svc:<15}{RESET} "
                          f"{RED}DOWN{RESET}")

            # System Load
            print(f"\n{BOLD_WHITE}System Load:{RESET}")
            try:
                load1, load5, load15 = os.getloadavg()
                l_color = GREEN if load1 < 2.0 else RED
                print(f"  {GRAY}Load:{RESET} "
                      f"{l_color}{load1:.2f} {load5:.2f} "
                      f"{load15:.2f}{RESET}")
            except Exception:
                pass

            time.sleep(2.0)

    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == "__main__":
    main()
