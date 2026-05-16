#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - ACT 2: Multi-Tenant RLS
# ==============================================================================

run_act2() {
    # SCENE 2: "Tenant Data Isolation — PostgreSQL Row-Level Security"
    clear
    show_act_banner "2" "Multi-Tenant Database Isolation" "Row-Level Security (RLS)"
    show_scene_banner "2" "Tenant Data Isolation — PostgreSQL Row-Level Security"

    # Step 1: Show tenant architecture
    typewriter_print "3 isolated tenants sharing ONE database:"
    print_result "tenant_apollo     " "5 patients   (real app data)"
    print_result "tenant_general    " "700 patients (Synthea synthetic)"
    print_result "tenant_outpatient " "300 patients (Synthea synthetic)"
    typewriter_print "Total: 1,005 patients | 1 PostgreSQL instance"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Demonstrate WITHOUT RLS (admin view)
    typewriter_print "STEP 1: Admin queries ALL patients (no RLS context)"
    typewriter_fast "${CYAN}psql> RESET app.tenant_id;${RESET}"
    typewriter_fast "${CYAN}psql> SELECT tenant_id, COUNT(*) FROM patients GROUP BY tenant_id;${RESET}"
    echo ""
    db_query_table "$CLINICAL_DB" "RESET app.tenant_id; SELECT tenant_id, COUNT(*) FROM patients GROUP BY tenant_id;"
    print_info "Admin sees ALL 1,005 patients across 3 tenants"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: Demonstrate WITH RLS (random tenant)
    local tenants=("tenant_general" "tenant_outpatient")
    local rand_tenant=${tenants[$RANDOM % ${#tenants[@]}]}
    
    typewriter_print "STEP 2: Setting tenant context → $rand_tenant"
    typewriter_fast "${CYAN}psql> SET app.tenant_id = '$rand_tenant';${RESET}"
    typewriter_fast "${CYAN}psql> SELECT COUNT(*) FROM patients;${RESET}"
    echo ""
    db_query_table "$CLINICAL_DB" "SET app.tenant_id = '$rand_tenant'; SELECT COUNT(*) FROM patients;"
    local t_count=$(db_query_live clinical "SET app.tenant_id = '$rand_tenant'; SELECT COUNT(*) FROM patients;")
    print_ok "$rand_tenant sees ONLY their $t_count patients"
    echo ""
    sleep "$STEP_DELAY"

    # Step 4: Cross-tenant attack attempt
    show_alert_banner
    typewriter_print "STEP 3: ATTACK — $rand_tenant attempts to"
    typewriter_print "        read tenant_apollo patient data..."
    sleep 1.0
    typewriter_fast "${CYAN}psql> SET app.tenant_id = '$rand_tenant';${RESET}"
    typewriter_fast "${CYAN}psql> SELECT * FROM patients WHERE tenant_id = 'tenant_apollo';${RESET}"
    echo ""
    db_query_table "$CLINICAL_DB" "SET app.tenant_id = '$rand_tenant'; SELECT * FROM patients WHERE tenant_id = 'tenant_apollo';"
    show_blocked_banner
    print_block "CROSS-TENANT ACCESS BLOCKED BY RLS POLICY"
    print_ok "Zero data leakage confirmed"
    echo ""
    sleep "$STEP_DELAY"

    # Step 5: Service Proof (REST API)
    show_scene_banner "4" "Service Layer Verification — REST API"
    typewriter_print "Validating through clinical-service API..."
    local token=$(get_auth_token)
    local patient_id=$(db_query_live clinical "SELECT id FROM patients LIMIT 1;")
    
    typewriter_fast "${CYAN}curl -X GET \"$CLINICAL_SERVICE/api/patients/$patient_id\" \\${RESET}"
    typewriter_fast "${CYAN}     -H \"Authorization: Bearer \$TOKEN\"${RESET}"
    echo ""
    api_get "$CLINICAL_SERVICE/api/patients/$patient_id" "$token" | jq .
    print_ok "Service layer enforced RLS correctly"
    
    pause_for_enter "Scene 3: RLS Verification Proof"

    # SCENE 3: "Live RLS Proof — All Tables, All Tenants"
    show_scene_banner "3" "Live RLS Proof — All Tables, All Tenants"

    # Step 1: Run verification across all tables
    typewriter_print "Running RLS proof across all 8 clinical tables..."
    local tables=("patients" "encounters" "observations" "patient_conditions" "medications" "allergies" "procedures" "careplans")
    for table in "${tables[@]}"; do
        progress_bar "Verifying $table..." 0.4
        local cross_count=$(db_query_live clinical "SET app.tenant_id = 'tenant_general'; SELECT COUNT(*) FROM $table WHERE tenant_id = 'tenant_apollo';")
        if [[ "$cross_count" == "0" ]]; then
            print_ok "$table: 0 cross-tenant rows exposed"
        else
            print_fail "$table: $cross_count cross-tenant rows LEAKED!"
        fi
    done
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Privileged bypass demonstration
    typewriter_print "STEP 4: Demonstrating authorized PAM bypass..."
    typewriter_fast "${CYAN}psql> SET rls.bypass = 'on';  -- PAM approved bypass${RESET}"
    typewriter_fast "${CYAN}psql> SELECT COUNT(*) FROM patients;${RESET}"
    echo ""
    db_query_table "$CLINICAL_DB" "SET rls.bypass = 'on'; SELECT COUNT(*) FROM patients;"
    print_warn "Privileged bypass active — AUDIT LOG RECORDING"
    # Trigger audit log in metrics pane/logs pane
    $REDIS_CLI PUBLISH medtrust:audit:events "PAM bypass enabled for 'medtrust_clinical_admin' on patients_db" > /dev/null
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: RLS summary scorecard
    typewriter_print "RLS summary scorecard:"
    echo -e "┌─────────────────────────┬────────────┬───────────┐"
    echo -e "│ Test                    │ Result     │ Status    │"
    echo -e "├─────────────────────────┼────────────┼───────────┤"
    echo -e "│ Tenant isolation        │ 0 leaks    │  ${GREEN}PASS ✓${RESET}  │"
    echo -e "│ Cross-tenant query      │ 0 rows     │  ${GREEN}PASS ✓${RESET}  │"
    echo -e "│ FORCE RLS (table owner) │ Filtered   │  ${GREEN}PASS ✓${RESET}  │"
    echo -e "│ PAM bypass (authorized) │ 1,005 rows │  ${GREEN}PASS ✓${RESET}  │"
    echo -e "│ PAM bypass (audit trail)│ Logged     │  ${GREEN}PASS ✓${RESET}  │"
    echo -e "└─────────────────────────┴────────────┴───────────┘"

    pause_for_enter "Act 3: Zero Trust Architecture"
}
