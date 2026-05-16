#!/usr/bin/env bash
# MedTrustX DHOS Simulation Launcher
# Orchestrates tmux environment and calls run.py

set -e
cd "$(dirname "$0")"

echo "Initializing Python virtual environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt -q

if [ "$1" == "--cleanup" ]; then
    echo "Cleaning up tmux session..."
    python3 run.py --cleanup
    exit 0
fi

echo "Setting up tmux session..."
# Kill existing session if present
tmux kill-session -t medtrustx-demo 2>/dev/null || true

# Start tmux via Python wrapper
python3 -c "
import sys
from core.tmux import create_session, start_log_pane, start_metrics_pane
if not create_session():
    print('Failed to create tmux session')
    sys.exit(1)
start_log_pane('Demo@MedTrustX2026')
start_metrics_pane('$(pwd)/bin/live_metrics.py')
"

echo "Launching main simulation sequence..."
# Launch the main Python script in pane 0
tmux send-keys -t medtrustx-demo:0.0 "source .venv/bin/activate && python3 run.py" C-m

# Attach to the session
tmux attach-session -t medtrustx-demo
