#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Progress Bars & Spinners
# ==============================================================================

# Load colors if not already loaded
if [[ -z "$BOLD_CYAN" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
fi

progress_bar() {
    local label=$1
    local duration=$2
    local steps=20
    local sleep_interval=$(echo "scale=4; $duration / $steps" | bc)
    
    printf "${WHITE}%-30s${RESET} [" "$label"
    
    for ((i=1; i<=steps; i++)); do
        local percent=$((i * 100 / steps))
        local color=$BOLD_GREEN
        if [ $percent -gt 60 ] && [ $percent -le 80 ]; then
            color=$BOLD_YELLOW
        elif [ $percent -gt 80 ]; then
            color=$BOLD_RED
        fi
        
        printf "${color}█${RESET}"
        sleep $sleep_interval
    done
    
    printf "] 100%%  ${duration}s\n"
}

spinner() {
    local label=$1
    local duration=$2
    local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local end_time=$((SECONDS + duration))
    
    while [ $SECONDS -lt $end_time ]; do
        for i in {0..9}; do
            printf "\r${BOLD_CYAN}${spin:$i:1}${RESET} ${WHITE}${label}${RESET}"
            sleep 0.1
        done
    done
    printf "\r${BOLD_GREEN}✓${RESET} ${WHITE}${label}${RESET} (Done)\n"
}

count_up() {
    local label=$1
    local target=$2
    local unit=$3
    local duration=$4
    
    local steps=50
    local sleep_interval=$(echo "scale=4; $duration / $steps" | bc)
    local increment=$((target / steps))
    if [ $increment -lt 1 ]; then increment=1; fi
    
    local current=0
    while [ $current -lt $target ]; do
        current=$((current + increment))
        if [ $current -gt $target ]; then current=$target; fi
        
        # Format with commas
        local formatted=$(printf "%'d" $current)
        printf "\r${CYAN}%-20s${RESET} : ${BOLD_WHITE}%s %s${RESET}" "$label" "$formatted" "$unit"
        sleep $sleep_interval
    done
    printf "\n"
}
