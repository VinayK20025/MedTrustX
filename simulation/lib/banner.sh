#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - ASCII Banners
# ==============================================================================

# Load colors if not already loaded
if [[ -z "$BOLD_CYAN" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
fi

show_main_banner() {
    clear
    echo -e "${BOLD_CYAN}"
    cat "$(dirname "${BASH_SOURCE[0]}")/../assets/medtrustx_banner.txt"
    echo -e "${RESET}"
    echo -e "${WHITE}  Digital Hospital Operating System — Security Research Presentation${RESET}"
    echo -e "${WHITE}  MedTrustX DHOS v2.0 | Production Architecture Demo${RESET}"
    echo -e "${GRAY}  $(date '+%B %d, %Y | %H:%M:%S UTC')${RESET}"
    echo -e ""
}

show_act_banner() {
    local act_num=$1
    local act_name=$2
    local module_name=$3
    
    echo -e "${BOLD_BLUE}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD_BLUE}║${RESET}  ${BOLD_WHITE}ACT ${act_num} — ${act_name}${RESET}"
    printf "${BOLD_BLUE}║${RESET}  ${CYAN}Module: ${module_name}${RESET}%*s${BOLD_BLUE}║${RESET}\n" $((53 - ${#module_name} - 8)) ""
    echo -e "${BOLD_BLUE}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""
}

show_scene_banner() {
    local scene_num=$1
    local scene_name=$2
    
    echo -e "${CYAN}┌──────────────────────────────────────────────────────────┐${RESET}"
    echo -e "${CYAN}│${RESET}  ${BOLD_CYAN}Scene ${scene_num}: ${scene_name}${RESET}"
    echo -e "${CYAN}└──────────────────────────────────────────────────────────┘${RESET}"
    echo ""
}

show_pass_banner() {
    echo -e "\n${BG_GREEN}${BOLD_WHITE}  ✓ PASSED  ${RESET}\n"
}

show_blocked_banner() {
    echo -e "\n${BG_RED}${BOLD_WHITE}  ✗ BLOCKED  ${RESET}\n"
}

show_alert_banner() {
    echo -e "\n${BG_YELLOW}${BOLD_RED}  ⚠ ALERT    ${RESET}\n"
}
