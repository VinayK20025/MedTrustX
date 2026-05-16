#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Pause Handler
# ==============================================================================

# Load colors if not already loaded
if [[ -z "$BOLD_YELLOW" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
fi

pause_for_enter() {
    local next_scene="$1"
    echo ""
    if [[ -n "$next_scene" ]]; then
        echo -e "${BOLD_YELLOW}[ Press ENTER to continue → ${next_scene} ]${RESET}"
    else
        echo -e "${BOLD_YELLOW}[ Press ENTER to continue ]${RESET}"
    fi
    read -r
}
