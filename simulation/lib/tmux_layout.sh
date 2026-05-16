#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Tmux Pane Management
# ==============================================================================

# Load config if not already loaded
if [[ -z "$REDIS_CLI" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/../config.sh"
fi

setup_tmux_session() {
    local session_name="medtrustx-demo"
    
    # Kill existing session if it exists
    tmux kill-session -t "$session_name" 2>/dev/null
    
    # Create session: medtrustx-demo
    # Layout: 3-pane horizontal split
    # Pane 0 (left, 60%):   MAIN — primary demo output
    # Pane 1 (top-right):   LOGS — live service logs
    # Pane 2 (bottom-right): METRICS — live DB counts
    
    tmux new-session -d -s "$session_name" -x 220 -y 50
    tmux split-window -h -p 40 -t "$session_name"
    tmux split-window -v -p 50 -t "$session_name:0.1"
    
    # Rename panes for clarity (optional, but good for management)
    # Note: renaming panes isn't a direct tmux command, but we can set titles
    tmux select-pane -t "$session_name:0.0" -T "MAIN"
    tmux select-pane -t "$session_name:0.1" -T "LOGS"
    tmux select-pane -t "$session_name:0.2" -T "METRICS"
}

send_to_pane() {
    local pane_id=$1
    local command=$2
    tmux send-keys -t "medtrustx-demo:0.${pane_id}" "${command}" Enter
}

start_log_pane() {
    # Pane 1: tail -f style output from Redis pub/sub
    local log_file="/root/MedTrustX/simulation/results/live_logs.log"
    # Ensure log file is fresh
    > "$log_file"

    local cmd="
        echo -e '\033[1;36m[ LOGS ] Subscribing to MedTrustX security events...\033[0m';
        $REDIS_CLI SUBSCRIBE medtrust:audit:events \
                          medtrust:zta:alerts \
                          medtrust:breach:incidents \
                          medtrust:clinical:alerts \
                          medtrust:gateway:threats | while read line; do
            if [[ \$line == 'message' ]]; then
                read channel
                read message
                case \$channel in
                    *audit*)   msg=\"\033[0;36m[AUDIT]\033[0m \$message\" ;;
                    *zta*)     msg=\"\033[1;31m[ZTA ALERT]\033[0m \$message\" ;;
                    *breach*)  msg=\"\033[41m\033[1;37m[BREACH]\033[0m \033[1;31m\$message\033[0m\" ;;
                    *clinical*) msg=\"\033[1;33m[CLINICAL]\033[0m \$message\" ;;
                    *gateway*)  msg=\"\033[1;31m[GATEWAY]\033[0m \$message\" ;;
                    *)         msg=\"\033[0;90m[\$channel]\033[0m \$message\" ;;
                esac
                echo -e \"\$msg\" | tee -a $log_file
            fi
        done
    "
    send_to_pane 1 "$cmd"
}

start_metrics_pane() {
    # Pane 2: loop every 5s showing live DB counts
    local script_path="$(dirname "${BASH_SOURCE[0]}")/../lib/db_query.sh"
    local config_path="$(dirname "${BASH_SOURCE[0]}")/../config.sh"
    
    local cmd="
        while true; do
            clear;
            echo -e '\033[1;36m┌─── LIVE METRICS ──────────────────┐\033[0m';
            
            # Use psql directly for metrics pane to avoid script overhead
            P_COUNT=\$(psql \"$CLINICAL_DB\" -t -c \"SELECT count(*) FROM patients;\" | xargs);
            A_COUNT=\$(psql \"$CLINICAL_DB\" -t -c \"SELECT count(*) FROM audit_log;\" | xargs);
            V_COUNT=\$(psql \"$ANALYTICS_DB\" -t -c \"SELECT count(*) FROM patient_vitals;\" | xargs);
            L_COUNT=\$(psql \"$IAM_DB\" -t -c \"SELECT count(*) FROM auth_logs;\" | xargs);
            R_COUNT=\$(psql \"$OPERATIONAL_DB\" -t -c \"SELECT count(*) FROM api_request_logs;\" | xargs);
            
            echo -e \" \033[1;37mpatients_db:\033[0m\";
            echo -e \"   patients      :  \033[1;32m\$P_COUNT\033[0m\";
            echo -e \"   audit_log     :  \033[1;32m\$A_COUNT\033[0m ↑\";
            echo -e \" \033[1;37manalytics_db:\033[0m\";
            echo -e \"   patient_vitals: \033[1;32m\$V_COUNT\033[0m\";
            echo -e \" \033[1;37miam_db:\033[0m\";
            echo -e \"   auth_logs     :  \033[1;32m\$L_COUNT\033[0m ↑\";
            echo -e \" \033[1;37mscheduling_db:\033[0m\";
            echo -e \"   api_requests  :  \033[1;32m\$R_COUNT\033[0m ↑\";
            echo -e '\033[1;36m└───────────────────────────────────┘\033[0m';
            echo -e \"\n \033[0;90mLast update: \$(date '+%H:%M:%S')\033[0m\";
            sleep 5;
        done
    "
    send_to_pane 2 "$cmd"
}
