#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Database Query Wrapper
# ==============================================================================

# Load colors if not already loaded
if [[ -z "$BOLD_GREEN" ]]; then
    source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"
fi

db_query() {
    local db_url=$1
    local sql=$2
    local label=$3
    
    # Execute psql with quiet mode and unaligned output for clean results
    local result=$(psql "$db_url" -t -c "$sql" 2>/dev/null | xargs)
    
    if [[ $? -eq 0 ]]; then
        print_result "$label" "$result"
        return 0
    else
        # Fallback if query fails
        print_result "$label" "\033[0;31mUnavailable (DB Offline)\033[0m"
        return 1
    fi
}

db_query_live() {
    local db_key=$1
    local sql=$2
    
    # Map db_key to connection string
    local db_url=""
    case $db_key in
        clinical)    db_url="$CLINICAL_DB" ;;
        operational) db_url="$OPERATIONAL_DB" ;;
        iam)         db_url="$IAM_DB" ;;
        analytics)   db_url="$ANALYTICS_DB" ;;
    esac
    
    # Execute with 5s timeout
    local result=$(timeout 5 psql "$db_url" -t -c "$sql" 2>/dev/null | xargs)
    echo "$result"
}

db_query_table() {
    local db_url=$1
    local sql=$2
    
    # Execute psql and show formatted table
    psql "$db_url" -c "$sql"
}
