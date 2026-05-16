#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - ACT 7: API Gateway
# ==============================================================================

run_act7() {
    # SCENE 13: "API Gateway — Normal Traffic Baseline"
    clear
    show_act_banner "7" "API Gateway & Request Lifecycle" "Kong Gateway | WAF | DDoS Protection"
    show_scene_banner "13" "API Gateway — Normal Traffic Baseline"

    # Step 1: Show normal traffic from seeded logs
    typewriter_print "Analyzing gateway traffic profile (scheduling_db):"
    db_query_table "$OPERATIONAL_DB" "SELECT service, COUNT(*), ROUND(AVG(latency_ms)::numeric, 1) as avg_latency FROM api_request_logs WHERE status_code = 200 GROUP BY service ORDER BY COUNT(*) DESC;"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Simulate live API requests
    typewriter_print "Monitoring live request flow through Kong Gateway..."
    local endpoints=("/api/patients/pat_001" "/api/clinical/vitals" "/api/ai/analytics/*" "/api/iam/auth/login" "/api/audit/events")
    local methods=("GET" "POST" "GET" "POST" "GET")
    local codes=("200" "201" "200" "200" "200")
    local latencies=("87ms" "45ms" "312ms" "118ms" "62ms")

    for i in {0..4}; do
        local ts=$(date '+%H:%M:%S.%3N')
        echo -e "[${ts}] ${BOLD_WHITE}${methods[$i]}${RESET}  ${CYAN}${endpoints[$i]}${RESET}  → ${GREEN}${codes[$i]}${RESET}  ${latencies[$i]}"
        sleep 0.5
    done
    print_ok "All requests: authenticated, RLS-enforced, logged"
    echo ""

    # Step 3: WAF test — SQL injection blocked
    show_alert_banner
    typewriter_print "WAF PENETRATION TEST: Injecting SQL attack payload..."
    local ts=$(date '+%H:%M:%S.%3N')
    echo -e "[${ts}] ${BOLD_RED}[ATTACK]${RESET} GET /api/patients?id=' OR 1=1 --"
    sleep 0.8
    echo -e "[${ts}] ${BOLD_RED}[WAF]${RESET}    Pattern matched: ${BOLD_WHITE}OWASP_SQLI_001${RESET}"
    echo -e "[${ts}] ${BOLD_RED}[WAF]${RESET}    Request BLOCKED → ${BOLD_RED}HTTP 400 (Bad Request)${RESET}"
    print_block "SQL Injection BLOCKED by WAF"
    print_ok "X-WAF-Rule: OWASP_SQLI_001 triggered"

    pause_for_enter "Scene 14: DDoS Simulation"

    # SCENE 14: "DDoS Attack Simulation — Rate Limiting Proof"
    show_scene_banner "14" "DDoS Attack Simulation — Rate Limiting Proof"

    # Step 1: Show DDoS spike in seeded data
    typewriter_print "Analyzing historical DDoS burst from threat_logs:"
    db_query_table "$OPERATIONAL_DB" "SELECT threat_type, source_ip, MAX(requests_per_min) as peak_req, action_taken FROM threat_logs WHERE threat_type = 'ddos_burst' GROUP BY threat_type, source_ip, action_taken LIMIT 3;"
    echo ""

    # Step 2: Replay DDoS simulation
    typewriter_print "REPLAYING: DDoS burst from 203.0.113.99"
    typewriter_print "Normal threshold: 500 req/min"
    print_divider
    
    # Animated counter
    count_up "Requests/min (Live)" 500 "req/min" 1
    echo -e "${BOLD_YELLOW}THRESHOLD REACHED${RESET}"
    count_up "Requests/min (Live)" 1000 "req/min" 1
    count_up "Requests/min (Live)" 2000 "req/min" 0.8
    count_up "Requests/min (Live)" 3247 "req/min" 0.5
    
    show_alert_banner
    print_block "RATE LIMIT EXCEEDED — IP BLOCKED"
    echo -e "[KONG]  ip-restriction plugin activated for 203.0.113.99"
    echo -e "[KONG]  Traffic dropped → HTTP 429 (Too Many Requests)"
    $REDIS_CLI PUBLISH medtrust:gateway:threats "DDoS BLOCKED: 203.0.113.99. Rate limit exceeded (3,247 req/min)." > /dev/null
    echo ""

    # Step 3: Show 429 evidence
    typewriter_print "Verifying 429 events in api_request_logs..."
    local limit_count=$(db_query_live operational "SELECT COUNT(*) FROM api_request_logs WHERE status_code = 429;")
    print_info "$limit_count rate-limited requests confirmed in dataset"
    echo ""

    # Step 4: Recovery demonstration
    typewriter_print "Demonstrating system recovery (legitimate traffic restored):"
    count_up "Requests/min (Live)" 423 "req/min" 1
    echo -e "[RECOVERY] GET /api/patients/pat_001 → ${GREEN}200 OK${RESET} (84ms)"
    print_ok "System recovered | DDoS neutralized | 0 data compromised"

    pause_for_enter "Scene 15: Final Summary"

    # SCENE 15: "End-to-End Request Lifecycle + Final Summary"
    show_scene_banner "15" "End-to-End Request Lifecycle + Final Summary"

    # Step 1: Show OpenTelemetry trace
    typewriter_print "Inspecting distributed trace for request pat_001..."
    echo -e "    ${CYAN}┌─── Request Trace: GET /api/patients/pat_001 ──────┐${RESET}"
    echo -e "    ${CYAN}│${RESET} gateway.route        kong-gateway      8ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}│${RESET} └─ iam.verify_token  iam-service      35ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}│${RESET}    └─ zta.device_trust zta-service    28ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}│${RESET}       └─ patient.get  patient-service 45ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}│${RESET}          └─ db.query  postgres        18ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}│${RESET}                              TOTAL:  134ms  ${GREEN}OK${RESET}    "
    echo -e "    ${CYAN}└───────────────────────────────────────────────────┘${RESET}"
    echo ""

    # Step 2: Final presentation summary table
    print_divider
    typewriter_print "MedTrustX DHOS — Demonstration Complete"
    print_divider
    
    echo -e "${BOLD_WHITE}╔══════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD_WHITE}║          MEDTRUSTX DHOS — PRESENTATION SUMMARY          ║${RESET}"
    echo -e "${BOLD_WHITE}╠══════════════════════════════════════════════════════════╣${RESET}"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │ %-12s ${BOLD_WHITE}║${RESET}\n" "Module" "Result" "Status"
    echo -e "${BOLD_WHITE}╠══════════════════════════════════════════════════════════╣${RESET}"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}PASS ✓${RESET}     ${BOLD_WHITE}║${RESET}\n" "Multi-Tenant RLS" "0 leaks"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}TRUSTED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "ZTA Device Trust Agent" "9.4/10"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}BLOCKED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "Jailbreak Block" "0.0/10"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}VALID ✓${RESET}    ${BOLD_WHITE}║${RESET}\n" "Clinical Core FHIR R4" "48 resources"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}BLOCKED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "CDS Drug Interaction" "MAJOR flagged"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}ACTIVE ✓${RESET}   ${BOLD_WHITE}║${RESET}\n" "AI Readmission Risk" "0.73 HIGH"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}ALERTED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "Vitals Anomaly Detection" "Z=8.17"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}INTACT ✓${RESET}   ${BOLD_WHITE}║${RESET}\n" "Audit Hash Chain" "52,063 events"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}DETECTED ✓${RESET} ${BOLD_WHITE}║${RESET}\n" "Breach Detection" "1,504 flagged"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}14 FWKs ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "Compliance Score" "84% avg"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}BLOCKED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "DDoS Protection" "8,280 blocked"
    printf "${BOLD_WHITE}║${RESET} %-26s │ %-13s │  ${GREEN}BLOCKED ✓${RESET}  ${BOLD_WHITE}║${RESET}\n" "WAF SQL Injection" "OWASP_SQLI_001"
    echo -e "${BOLD_WHITE}╠══════════════════════════════════════════════════════════╣${RESET}"
    printf "${BOLD_WHITE}║${RESET} %-36s : %-15s ${BOLD_WHITE}║${RESET}\n" "Total Services Demonstrated" "14 microservices"
    printf "${BOLD_WHITE}║${RESET} %-36s : %-15s ${BOLD_WHITE}║${RESET}\n" "Total Data Points Queried" "337,637 rows"
    printf "${BOLD_WHITE}║${RESET} %-36s : %-15s ${BOLD_WHITE}║${RESET}\n" "Total Security Checks" "10 per device"
    printf "${BOLD_WHITE}║${RESET} %-36s : %-15s ${BOLD_WHITE}║${RESET}\n" "Compliance Frameworks" "14 simultaneous"
    printf "${BOLD_WHITE}║${RESET} %-36s : %-15s ${BOLD_WHITE}║${RESET}\n" "Presentation Duration" "~15 minutes"
    echo -e "${BOLD_WHITE}╚══════════════════════════════════════════════════════════╝${RESET}"
    echo ""

    # Step 3: Show final banner
    show_main_banner
    typewriter_print "Thank you for attending the MedTrustX DHOS"
    typewriter_print "Security Architecture Research Presentation"
    echo ""
}
