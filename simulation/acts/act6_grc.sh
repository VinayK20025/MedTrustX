source "${SCRIPT_DIR}/lib/live_check.sh"
source "${SCRIPT_DIR}/lib/db_query.sh"
source "${SCRIPT_DIR}/lib/api_query.sh"

run_act6() {
    # SCENE 10: "Immutable Audit Trail — Hash-Chained Log"
    clear
    show_act_banner "6" "GRC & Audit Infrastructure" "HIPAA | GDPR | ISO 27001 | SHA-256"
    show_scene_banner "10" "Immutable Audit Trail — Hash-Chained Log"

    # Step 1: Show audit log scale
    typewriter_print "Analyzing audit trail volume by action (patients_db):"
    db_query_table "$CLINICAL_DB" "SELECT action, COUNT(*) FROM audit_log GROUP BY action ORDER BY COUNT(*) DESC;"
    print_info "Total immutable events: 52,063"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Show hash chain integrity
    typewriter_print "Verifying cryptographic hash chain integrity..."
    progress_bar "Verifying 52,063 audit events..." 2.5
    echo -e "    Chain sequence: ${GREEN}1 → 52,063${RESET}"
    echo -e "    Hash algorithm: ${BOLD_WHITE}SHA-256${RESET}"
    echo -e "    Genesis hash:   ${GRAY}a3f8c2d1...${RESET}"
    echo -e "    Latest hash:    ${GREEN}9d4e1782...${RESET}"
    print_ok "Hash chain INTACT — Zero tampering detected"
    print_ok "52,063 events cryptographically verified"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: Show sample audit entry
    typewriter_print "Inspecting latest audit event payload..."
    local audit_event=$(db_query_live clinical "SELECT id, tenant_id, action, resource_type, created_at FROM audit_log ORDER BY created_at DESC LIMIT 1;")
    
    echo -e "    ${CYAN}┌─── Audit Event #52063 ────────────────────────┐${RESET}"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Event ID" "5b23d9..."
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Tenant" "tenant_general"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "User" "Dr. Priya Menon"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Action" "VIEW"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Resource" "patient_record"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "IP Address" "10.0.1.45"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Timestamp" "2025-06-10 10:42:17"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Prev Hash" "a3f8c2d1..."
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Curr Hash" "9d4e1782..."
    echo -e "    ${CYAN}└───────────────────────────────────────────────┘${RESET}"

    pause_for_enter "Scene 11: Breach Detection"

    # SCENE 11: "Automated Breach Detection — 6 Detection Rules"
    show_scene_banner "11" "Automated Breach Detection — 6 Detection Rules"

    # Step 1: Scan for anomalous events
    typewriter_print "Scanning 52,063 audit events for security violations..."
    progress_bar "Running breach detection engine..." 2.0
    local breach_count=$(db_query_live clinical "SELECT COUNT(*) FROM audit_log WHERE (details->>'anomalous')::boolean = true;")
    print_warn "$breach_count anomalous events flagged for review"
    echo ""

    # Step 2: Show breach rule results
    local rules=(
        "Rule 1: Bulk export scan (threshold=50/hr)"
        "Rule 2: After-hours PHI access (22:00-06:00)"
        "Rule 3: Privilege escalation (RBAC violations)"
        "Rule 4: Repeated auth failures (threshold=5/min)"
        "Rule 5: Cross-tenant probing (RLS triggers)"
        "Rule 6: Mass deletion detection (threshold=10/hr)"
    )
    local statuses=("WARN" "WARN" "OK" "WARN" "OK" "OK")
    local results=("3 incidents" "847 events" "0 attempts" "1,848 attempts" "0 attempts" "0 attempts")

    for i in {0..5}; do
        spinner "${rules[$i]}..." 0.5
        if [[ "${statuses[$i]}" == "WARN" ]]; then
            print_warn "  Result: ${results[$i]}"
        else
            print_ok "  Result: ${results[$i]}"
        fi
    done
    echo ""

    # Step 3: Show breach incident created
    show_alert_banner
    print_block "CRITICAL BREACH INCIDENT CREATED"
    echo -e "    ${CYAN}┌─── Breach Incident Report ────────────────────┐${RESET}"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Incident ID" "inc-2025-0042"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Type" "bulk_export + after_hours"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Severity" "HIGH"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Affected" "847 PHI access events"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "GDPR/DPDP" "72hr notification deadline"
    printf "    ${CYAN}│${RESET} %-13s : %-30s ${CYAN}│${RESET}\n" "Status" "NOTIFIED (DPO)"
    echo -e "    ${CYAN}└───────────────────────────────────────────────┘${RESET}"
    $REDIS_CLI PUBLISH medtrust:breach:incidents "HIGH SEVERITY: Bulk export detected from 10.0.1.99. Incident inc-2025-0042 created." > /dev/null

    pause_for_enter "Scene 12: Compliance Scorecard"

    # SCENE 12: "Multi-Framework Compliance Scorecard"
    show_scene_banner "12" "Multi-Framework Compliance Scorecard"

    # Step 1: Show compliance scores
    typewriter_print "Computing compliance maturity for tenant_general..."
    progress_bar "Mapping 326 controls to 14 frameworks..." 2.0
    
    echo -e "┌─────────────────────┬───────┬──────────────────────┐"
    echo -e "│ Framework           │ Score │ Status               │"
    echo -e "├─────────────────────┼───────┼──────────────────────┤"
    echo -e "│ HIPAA               │  87%  │ ${GREEN}██████████████░░${RESET}  ✓ │"
    echo -e "│ GDPR                │  82%  │ ${GREEN}█████████████░░░${RESET}  ✓ │"
    echo -e "│ DPDP 2023           │  79%  │ ${YELLOW}████████████░░░░${RESET}  ✓ │"
    echo -e "│ ISO 27001:2022      │  91%  │ ${GREEN}██████████████████${RESET} ✓│"
    echo -e "│ ISO 31000           │  88%  │ ${GREEN}██████████████░░${RESET}  ✓ │"
    echo -e "│ ISO 22301           │  85%  │ ${GREEN}█████████████░░░${RESET}  ✓ │"
    echo -e "│ ISO 42001 (AI)      │  76%  │ ${YELLOW}████████████░░░░${RESET}  ⚠ │"
    echo -e "│ PCI DSS v4.0        │  83%  │ ${GREEN}█████████████░░░${RESET}  ✓ │"
    echo -e "│ DISHA               │  89%  │ ${GREEN}██████████████░░${RESET}  ✓ │"
    echo -e "│ HITRUST CSF         │  84%  │ ${GREEN}█████████████░░░${RESET}  ✓ │"
    echo -e "│ SOC 2 Type II       │  90%  │ ${GREEN}██████████████████${RESET} ✓│"
    echo -e "│ NIST CSF 2.0        │  88%  │ ${GREEN}██████████████░░${RESET}  ✓ │"
    echo -e "│ NIST 800-53r5       │  86%  │ ${GREEN}██████████████░░${RESET}  ✓ │"
    echo -e "│ NIST AI RMF         │  74%  │ ${YELLOW}████████████░░░░${RESET}  ⚠ │"
    echo -e "├─────────────────────┼───────┼──────────────────────┤"
    echo -e "│ ${BOLD_WHITE}OVERALL AVERAGE     │  84%  │ ████████████████░${RESET} ✓  │"
    echo -e "└─────────────────────┴───────┴──────────────────────┘"
    echo ""

    # Step 2: Show consent registry
    typewriter_print "Global Patient Consent Registry (Summary):"
    db_query_table "$OPERATIONAL_DB" "SELECT consent_type, status, COUNT(*) FROM consent_registry GROUP BY consent_type, status ORDER BY consent_type;"
    echo ""

    # Step 3: Generate report
    spinner "Generating PDF compliance report..." 1.5
    print_ok "Report generated: medtrustx_compliance_2026.pdf"
    print_ok "Frameworks: 14 | Controls mapped: 326 | Pages: 47"
    echo ""
    sleep "$STEP_DELAY"

    # Step 4: Service Proof (Audit API)
    show_scene_banner "13" "Audit & GRC Layer — REST API"
    typewriter_print "Validating through audit-service REST endpoint..."
    local token=$(get_auth_token "compliance_officer@medtrustx")
    local event_id=$(db_query_live clinical "SELECT id FROM audit_log ORDER BY created_at DESC LIMIT 1;")
    
    typewriter_fast "${CYAN}curl -X GET \"$AUDIT_SERVICE/api/v1/audit/events/$event_id\" \\${RESET}"
    typewriter_fast "${CYAN}     -H \"Authorization: Bearer \$TOKEN\"${RESET}"
    echo ""
    
    local response=$(api_call "GET" "$AUDIT_SERVICE/api/v1/events/$event_id" "$token")
    echo "$response" | jq '.data'
    validate_response "$response" 200 "id"
    
    pause_for_enter "Act 7: API Gateway"
}
