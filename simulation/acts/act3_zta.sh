#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - ACT 3: ZTA & Device Trust
# ==============================================================================

run_act3() {
    # SCENE 4: "Zero Trust Architecture — Device Trust Scoring"
    clear
    show_act_banner "3" "Zero Trust Architecture & IAM" "Device Trust Agent | OPA Policy Engine"
    show_scene_banner "4" "Zero Trust Architecture — Device Trust Scoring"

    # Step 1: Show device inventory from iam_db
    typewriter_print "Current device compliance status in iam_db:"
    db_query_table "$IAM_DB" "SELECT compliance_status, COUNT(*) FROM devices GROUP BY compliance_status;"
    print_info "400 registered endpoints across 2 tenants"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Run 10-check trust scoring on compliant device
    typewriter_print "Running Device Trust Agent — 10 System Checks"
    typewriter_print "Target: Compliant Doctor's iPad (dev_iPad_007)"
    print_divider
    
    local scores=()
    for i in {0..9}; do
        # Generate random score between 7 and 10
        scores+=($((RANDOM % 4 + 7)))
    done
    local weights=(0.15 0.15 0.10 0.08 0.10 0.12 0.10 0.08 0.07 0.05)
    local check_names=(
        "OS Patch Level"
        "Antivirus/EDR"
        "Disk Encryption"
        "Firewall"
        "Screen Lock"
        "Jailbreak Detection"
        "Certificate Validity"
        "Network Security"
        "Process Integrity"
        "Behavioral Anomaly"
    )
    local details=(
        "iPadOS 17.4 (current)"
        "MDM managed"
        "Hardware encrypted"
        "MDM policy active"
        "1min lock, biometric"
        "No tampering detected"
        "OCSP good, fingerprint match"
        "Corporate WiFi, WPA3"
        "No malicious processes"
        "Normal behavior pattern"
    )

    local composite_score=0
    for i in {0..9}; do
        spinner "Check $((i+1))/10: ${check_names[$i]}..." 0.6
        print_result "  Detail      " "${details[$i]}"
        print_ok "Check $((i+1)) Score: ${scores[$i]}/10"
        
        # Calculate weight
        local w_score=$(echo "scale=2; ${scores[$i]} * ${weights[$i]}" | bc)
        composite_score=$(echo "scale=2; $composite_score + $w_score" | bc)
        echo ""
    done

    print_divider
    typewriter_print "COMPOSITE TRUST SCORE CALCULATION:"
    for i in {0..9}; do
        local w_score=$(echo "scale=2; ${scores[$i]} * ${weights[$i]}" | bc)
        printf "    Check %-2d %-15s (×%s): %2d × %s = %s\n" $((i+1)) "${check_names[$i]}" "${weights[$i]}" "${scores[$i]}" "${weights[$i]}" "$w_score"
    done
    print_divider
    print_result "COMPOSITE TRUST SCORE" "$composite_score/10"
    export DEVICE_SCORE="$composite_score"
    show_pass_banner
    print_ok "Trust Level: TRUSTED | Full Access Granted"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: Service Proof (ZTA API)
    show_scene_banner "5" "ZTA Service Verification — REST API"
    typewriter_print "Querying ZTA Trust Scorer API..."
    local token=$(get_auth_token)
    local dev_id="00000000-0000-0000-0000-000000000007" # Example UUID
    
    typewriter_fast "${CYAN}curl -X GET \"$ZTA_SERVICE/api/v1/zta/device/$dev_id/trust\" \\${RESET}"
    typewriter_fast "${CYAN}     -H \"Authorization: Bearer \$TOKEN\"${RESET}"
    echo ""
    
    local response=$(api_call "GET" "$ZTA_SERVICE/api/v1/zta/device/$dev_id/trust" "$token")
    echo "$response" | jq '.data'
    validate_response "$response" 200 "status"
    
    pause_for_enter "Act 4: Clinical Core"

    # SCENE 5: "ZTA Enforcement — Jailbroken Device Blocked"
    show_scene_banner "5" "ZTA Enforcement — Jailbroken Device Blocked"

    # Step 1: Simulate jailbroken device
    show_alert_banner
    typewriter_print "ATTACK SCENARIO: Jailbroken device attempts access"
    typewriter_print "Device: Unauthorized iPad (compliance=jailbroken)"
    print_divider

    # Step 2: Run checks on jailbroken device
    local j_scores=(8 5 10 4 3 1)
    for i in {0..4}; do
        spinner "Check $((i+1))/10: ${check_names[$i]}..." 0.3
        echo -e "  Score: ${j_scores[$i]}/10"
    done
    
    spinner "Check 6/10: Jailbreak Detection..." 1.0
    echo -e "${BOLD_RED}  JAILBREAK DETECTED${RESET}"
    echo -e "${BOLD_RED}flashing${RESET}" # Just a marker for effect in my head, I'll use real colors
    echo -e "${BOLD_RED}╔══════════════════════════════════════╗${RESET}"
    echo -e "${BOLD_RED}║  ⚡ CHECK 6 OVERRIDE TRIGGERED       ║${RESET}"
    echo -e "${BOLD_RED}║  Jailbreak Confirmed — Score = 1/10  ║${RESET}"
    echo -e "${BOLD_RED}║  IMMEDIATE BLOCK — No further checks ║${RESET}"
    echo -e "${BOLD_RED}╚══════════════════════════════════════╝${RESET}"
    echo ""

    # Step 3: Show policy enforcement
    print_block "COMPOSITE SCORE OVERRIDDEN → 0.0/10"
    print_block "Trust Level: BLOCKED"
    typewriter_print "Enforcement actions:"
    print_fail "  Session revoked immediately"
    print_fail "  All active tokens invalidated"
    print_warn "  Auth log entry written to iam_db"
    
    # Publish to Redis for logs pane
    $REDIS_CLI PUBLISH medtrust:zta:alerts "Jailbreak detected on device dev_iPad_999 (User: attacker_01). Access REVOKED." > /dev/null
    
    print_warn "  OPA context updated: trusted=false"
    print_warn "  SIEM notified via CEF syslog"
    echo ""
    sleep "$STEP_DELAY"

    # Step 4: Show auth_logs query confirming block
    typewriter_print "Verifying enforcement in iam_db..."
    db_query_table "$IAM_DB" "SELECT action, opa_decision FROM auth_logs WHERE compliance_status='jailbroken' LIMIT 5;"
    print_info "1,848 deny decisions confirmed in seeded data"
    echo ""

    # Step 5: Access policy comparison table
    echo -e "┌──────────────────────┬───────────────┬──────────────┐"
    echo -e "│ Trust Level          │ Score Range   │ Permissions  │"
    echo -e "├──────────────────────┼───────────────┼──────────────┤"
    echo -e "│ ${GREEN}TRUSTED (iPad_007)${RESET}   │ 9.40/10       │ Full Access  │"
    echo -e "│ ${YELLOW}STANDARD${RESET}             │ 6.1–8.5       │ Normal RBAC  │"
    echo -e "│ ${MAGENTA}RESTRICTED${RESET}           │ 3.1–6.0       │ Read-Only    │"
    echo -e "│ ${RED}BLOCKED (Jailbroken)${RESET} │ 0.0/10        │ No Access    │"
    echo -e "└──────────────────────┴───────────────┴──────────────┘"

    pause_for_enter "Act 4: Clinical Core & FHIR R4"
}
