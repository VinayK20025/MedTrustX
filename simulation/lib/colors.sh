#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Color System
# ==============================================================================

# Reset
RESET='\033[0m'

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'

# Bold variants
BOLD_RED='\033[1;31m'
BOLD_GREEN='\033[1;32m'
BOLD_CYAN='\033[1;36m'
BOLD_YELLOW='\033[1;33m'
BOLD_BLUE='\033[1;34m'
BOLD_MAGENTA='\033[1;35m'
BOLD_WHITE='\033[1;37m'

# Background colors
BG_RED='\033[41m'
BG_GREEN='\033[42m'
BG_BLUE='\033[44m'
BG_YELLOW='\033[43m'

# Status functions:
print_ok() {
    echo -e "${BOLD_GREEN}[  OK  ]${RESET} $1"
}

print_fail() {
    echo -e "${BOLD_RED}[ FAIL ]${RESET} $1"
}

print_warn() {
    echo -e "${BOLD_YELLOW}[ WARN ]${RESET} $1"
}

print_info() {
    echo -e "${BOLD_CYAN}[ INFO ]${RESET} $1"
}

print_block() {
    echo -e "${BG_RED}${BOLD_WHITE}[BLOCKED]${RESET} ${BOLD_RED}$1${RESET}"
}

print_allow() {
    echo -e "${BG_GREEN}${BOLD_WHITE}[ALLOW]${RESET} ${BOLD_GREEN}$1${RESET}"
}

print_step() {
    echo -e "${BOLD_BLUE}[STEP $1]${RESET} ${WHITE}$2${RESET}"
}

print_result() {
    local label=$1
    local value=$2
    printf "${CYAN}%-20s${RESET} : ${WHITE}%s${RESET}\n" "$label" "$value"
}

print_header() {
    echo -e "\n${BOLD_CYAN}# $1${RESET}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}

print_divider() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
}
