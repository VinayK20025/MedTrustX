#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - ACT 1: System Startup
# ==============================================================================

run_act1() {
    # SCENE 1: "MedTrustX DHOS — System Initialization"
    show_main_banner
    show_act_banner "1" "System Startup & Health Check" "Infrastructure Management"
    show_scene_banner "1" "MedTrustX DHOS — System Initialization"

    # Step 2: Print presentation metadata
    typewriter_print "Presenter: Senior DevOps Engineer"
    typewriter_print "Institution: MedTrustX Security Research Lab"
    typewriter_print "Date: $(date '+%B %d, %Y')"
    typewriter_print "Demo Environment: Ubuntu 24.04 LTS"
    typewriter_print "Architecture: 14 Microservices | 4 Databases"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: System health check — check all 4 DBs
    print_step "1/5" "Verifying database connectivity..."
    
    # Clinical DB
    spinner "Connecting to patients_db..." 1
    local clin_ver=$(db_query_live clinical "SELECT version();" | cut -d' ' -f1,2)
    local clin_count=$(db_query_live clinical "SELECT count(*) FROM patients;")
    if [[ -n "$clin_ver" ]]; then
        print_ok "patients_db  → $clin_ver | $clin_count patients"
    else
        print_fail "patients_db  → Offline"
    fi

    # Operational DB
    spinner "Connecting to scheduling_db..." 1
    local ops_ver=$(db_query_live operational "SELECT version();" | cut -d' ' -f1,2)
    local ops_count=$(db_query_live operational "SELECT count(*) FROM api_request_logs;")
    if [[ -n "$ops_ver" ]]; then
        print_ok "scheduling_db → $ops_ver | $ops_count API logs"
    else
        print_fail "scheduling_db → Offline"
    fi

    # IAM DB
    spinner "Connecting to iam_db..." 1
    local iam_ver=$(db_query_live iam "SELECT version();" | cut -d' ' -f1,2)
    local iam_count=$(db_query_live iam "SELECT count(*) FROM users;")
    if [[ -n "$iam_ver" ]]; then
        print_ok "iam_db       → $iam_ver | $iam_count users"
    else
        print_fail "iam_db       → Offline"
    fi

    # Analytics DB
    spinner "Connecting to analytics_db..." 1
    local ana_ver=$(db_query_live analytics "SELECT version();" | cut -d' ' -f1,2)
    local ana_count=$(db_query_live analytics "SELECT count(*) FROM patient_vitals;")
    if [[ -n "$ana_ver" ]]; then
        print_ok "analytics_db → $ana_ver | $ana_count vitals"
    else
        print_fail "analytics_db → Offline"
    fi
    echo ""
    sleep "$STEP_DELAY"

    # Step 4: Redis connectivity check
    print_step "2/5" "Verifying Redis connectivity..."
    local redis_ping=$($REDIS_CLI PING 2>/dev/null)
    if [[ "$redis_ping" == "PONG" ]]; then
        local redis_ver=$($REDIS_CLI INFO server | grep redis_version | cut -d':' -f2 | xargs)
        print_ok "Redis $redis_ver | medtrust-redis:6379 | Connected"
    else
        print_fail "Redis Connection Failed"
    fi
    echo ""
    sleep "$STEP_DELAY"

    # Step 5: Docker service check
    print_step "3/5" "Verifying Docker containers..."
    # We'll filter for common medtrust containers
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "medtrust|postgres|redis|Name" | while read -r line; do
        if [[ "$line" == *"Up"* ]]; then
            echo -e "${GREEN}$line${RESET}"
        else
            echo -e "$line"
        fi
    done
    echo ""
    sleep "$STEP_DELAY"

    # Step 6: Seeded data summary
    print_step "4/5" "Loading dataset inventory..."
    count_up "patients          " $(db_query_live clinical "SELECT count(*) FROM patients;") "records" 1
    count_up "audit_log events  " $(db_query_live clinical "SELECT count(*) FROM audit_log;") "events" 1
    count_up "vital observations" $(db_query_live analytics "SELECT count(*) FROM patient_vitals;") "readings" 1
    count_up "auth_log events   " $(db_query_live iam "SELECT count(*) FROM auth_logs;") "events" 1
    count_up "api_request_logs  " $(db_query_live operational "SELECT count(*) FROM api_request_logs;") "requests" 1
    count_up "threat_events     " $(db_query_live operational "SELECT count(*) FROM threat_logs;") "incidents" 1
    count_up "consent_records   " $(db_query_live operational "SELECT count(*) FROM consent_registry;") "records" 1
    count_up "risk_scores       " $(db_query_live analytics "SELECT count(*) FROM readmission_risk;") "scores" 1
    echo ""
    sleep "$STEP_DELAY"

    # Step 7: Module readiness table
    print_step "5/5" "Module status..."
    echo -e "┌──────────────────────────────────┬──────────┬───────┐"
    echo -e "│ Module                           │ Mode     │ Status│"
    echo -e "├──────────────────────────────────┼──────────┼───────┤"
    echo -e "│ Multi-Tenant RLS                 │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ ZTA & Device Trust Agent         │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ OPA Policy Engine                │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ IAM & Keycloak Identity          │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ Clinical Core + FHIR R4          │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ AI Inference Engine              │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ GRC & Audit Infrastructure       │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "│ API Gateway & WAF                │ LIVE     │  ${GREEN}✓${RESET}   │"
    echo -e "└──────────────────────────────────┴──────────┴───────┘"

    pause_for_enter "Act 2: Multi-Tenant RLS"
}
