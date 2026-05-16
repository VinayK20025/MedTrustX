"""Table and JSON display using tabulate."""
import json
from tabulate import tabulate
from core.colors import *

def display_table(rows: list[list],
                  headers: list[str],
                  title: str = "",
                  tablefmt: str = "rounded_outline") -> None:
    """Display data as formatted table with optional title."""
    if title:
        print(f"\n{BOLD_WHITE}{title}{RESET}")
    # Colorize rows
    colored_rows = []
    for row in rows:
        colored_row = [colorize_value(str(cell))
                       for cell in row]
        colored_rows.append(colored_row)
    colored_headers = [f"{BOLD_CYAN}{h}{RESET}"
                       for h in headers]
    print(tabulate(colored_rows, headers=colored_headers,
                   tablefmt=tablefmt))

def display_json(data: dict | list,
                 title: str = "",
                 highlight_keys: list[str] = None) -> None:
    """Pretty-print JSON with colorized keys/values."""
    if title:
        print(f"\n{BOLD_WHITE}{title}{RESET}")
    if isinstance(data, (dict, list)):
        formatted = json.dumps(data, indent=2,
                               default=str)
    else:
        formatted = str(data)
    for line in formatted.split('\n'):
        # Colorize keys
        if '":' in line:
            key_part, _, val_part = line.partition('":')
            key = key_part.strip().strip('"')
            is_highlighted = (highlight_keys and
                              key in highlight_keys)
            key_color = BOLD_YELLOW if is_highlighted \
                        else BOLD_CYAN
            line = (f"  {key_color}\"{key}\"{RESET}"
                    f"\"{RESET}:{val_part}")
        # Colorize values
        stripped = line.strip()
        if stripped.startswith('"'):
            line = line.replace(stripped,
                                f"{GREEN}{stripped}{RESET}")
        elif stripped.replace('.','').replace('-','')\
                .isdigit():
            line = line.replace(stripped,
                                f"{CYAN}{stripped}{RESET}")
        elif stripped in ('true', 'false', 'null'):
            color = GREEN if stripped == 'true' \
                    else RED if stripped == 'false' \
                    else GRAY
            line = line.replace(stripped,
                                f"{color}{stripped}{RESET}")
        print(line)

def display_fhir_resource(resource: dict) -> None:
    """Display FHIR resource with colored resourceType."""
    resource_type = resource.get('resourceType', 'Unknown')
    resource_id   = resource.get('id', 'N/A')
    print(f"\n{GRAY}── FHIR R4 Resource "
          f"{'─' * 40}{RESET}")
    print(f"  {GRAY}resourceType:{RESET} "
          f"{BOLD_CYAN}{resource_type}{RESET}")
    print(f"  {GRAY}id:{RESET} {GRAY}{resource_id}{RESET}")
    # Print up to 20 more fields
    count = 0
    for key, value in resource.items():
        if key in ('resourceType', 'id'):
            continue
        if count >= 20:
            remaining = len(resource) - 22
            print(f"  {GRAY}... {remaining} "
                  f"more fields{RESET}")
            break
        v = str(value)[:60]
        print(f"  {CYAN}{key}:{RESET} {v}")
        count += 1
    print(f"{GRAY}{'─' * 60}{RESET}")

def display_compliance_scorecard(scores: dict) -> None:
    """Display 14-framework compliance scorecard."""
    print(f"\n{BOLD_WHITE}Compliance Scorecard "
          f"— 14 Frameworks{RESET}")
    print(f"{CYAN}{'─' * 60}{RESET}")
    rows = []
    for framework, score in scores.items():
        pct = int(score)
        bar_len = int(20 * pct / 100)
        bar = '█' * bar_len + '░' * (20 - bar_len)
        color = GREEN if pct >= 85 \
            else YELLOW if pct >= 70 else RED
        status = '✓' if pct >= 70 else '⚠'
        rows.append([
            framework,
            f"{color}{pct}%{RESET}",
            f"{color}{bar}{RESET}",
            f"{color}{status}{RESET}"
        ])
    print(tabulate(rows,
                   headers=['Framework', 'Score',
                             'Progress', 'Status'],
                   tablefmt='rounded_outline'))

def display_trace_waterfall(spans: list[dict]) -> None:
    """Display distributed trace as waterfall diagram."""
    print(f"\n{BOLD_WHITE}Distributed Trace "
          f"Waterfall{RESET}")
    print(f"{CYAN}{'─' * 60}{RESET}")
    for i, span in enumerate(spans):
        indent = "  " * (i // 2)
        prefix = "└─ " if i > 0 else ""
        op = span.get('operation', 'unknown')
        svc = span.get('service', 'unknown')
        dur = span.get('duration_ms', 0)
        status = span.get('status', 'OK')
        status_color = GREEN if status == 'OK' else RED
        print(
            f"  {GRAY}{indent}{prefix}{RESET}"
            f"{CYAN}{op:<35}{RESET}"
            f"{GRAY}{svc:<20}{RESET}"
            f"{YELLOW}{dur}ms{RESET}  "
            f"{status_color}{status}{RESET}"
        )
    print(f"{CYAN}{'─' * 60}{RESET}")
