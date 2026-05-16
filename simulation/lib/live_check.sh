#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Live/Scripted Mode Detection
# ==============================================================================

# Load config if not already loaded
if [[ -z "$ZTA_SERVICE" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/../config.sh"
fi

# Load typewriter if not already loaded
if [[ -z "$TYPEWRITER_DELAY" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/typewriter.sh"
fi

detect_mode() {
    local service_url=$1
    local service_name=$2
    
    # Try common health endpoints
    local endpoints=("/api/v1/health" "/health" "/api/health")
    
    for ep in "${endpoints[@]}"; do
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 1 "${service_url}${ep}" 2>/dev/null)
        if [ "$status_code" == "200" ]; then
            return 0 # Live
        fi
    done
    
    return 1 # Scripted
}

run_live_or_scripted() {
    local service_name=$1
    local service_url=$2
    local live_cmd=$3
    local scripted_file=$4
    
    if detect_mode "$service_url" "$service_name"; then
        # Execute live command
        eval "$live_cmd"
    else
        # Read scripted file, replay with typewriter effect
        local file_path="$(dirname "${BASH_SOURCE[0]}")/../scripted/${scripted_file}"
        if [[ -f "$file_path" ]]; then
            while IFS= read -r line; do
                typewriter_fast "\033[0;90m[SIMULATED]\033[0m $line"
            done < "$file_path"
        else
            echo -e "\033[0;31mError: Scripted file $scripted_file not found.\033[0m"
        fi
    fi
}
