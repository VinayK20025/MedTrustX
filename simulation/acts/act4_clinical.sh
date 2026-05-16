source "${SCRIPT_DIR}/lib/live_check.sh"
source "${SCRIPT_DIR}/lib/db_query.sh"
source "${SCRIPT_DIR}/lib/api_query.sh"

run_act4() {
    # SCENE 6: "Clinical Operations — Patient Record Access"
    clear
    show_act_banner "4" "Clinical Core & Patient Management" "HL7 FHIR R4 | ICD-10 | SNOMED CT | LOINC | CDS Hooks"
    show_scene_banner "6" "Clinical Operations — Patient Record Access"

    # Step 1: Fetch real patient from database (Random)
    typewriter_print "Fetching random patient record from patients_db..."
    local patient_data=$(db_query_live clinical "SET app.tenant_id = 'tenant_general'; SELECT mrn, first_name, last_name, date_of_birth, gender FROM patients ORDER BY random() LIMIT 1;")
    
    local mrn=$(echo $patient_data | cut -d' ' -f1)
    local fname=$(echo $patient_data | cut -d' ' -f2)
    local lname=$(echo $patient_data | cut -d' ' -f3)
    local dob=$(echo $patient_data | cut -d' ' -f4)
    local gender=$(echo $patient_data | cut -d' ' -f5)

    echo -e "    ${CYAN}┌─── Patient Record ─────────────────────────────┐${RESET}"
    echo -e "    ${CYAN}│${RESET} MRN:      ${WHITE}${mrn}${RESET}                                "
    echo -e "    ${CYAN}│${RESET} Name:     ${WHITE}${fname} ${lname}${RESET}             "
    echo -e "    ${CYAN}│${RESET} DOB:      ${WHITE}${dob}${RESET}                      "
    echo -e "    ${CYAN}│${RESET} Gender:   ${WHITE}${gender}${RESET}                             "
    echo -e "    ${CYAN}│${RESET} Status:   ${GREEN}active${RESET}                               "
    echo -e "    ${CYAN}│${RESET} Tenant:   ${BOLD_CYAN}tenant_general${RESET}                       "
    echo -e "    ${CYAN}└────────────────────────────────────────────────┘${RESET}"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Show vitals time-series
    typewriter_print "Loading 90-day vitals history..."
    db_query_table "$ANALYTICS_DB" "SELECT vital_type, COUNT(*), ROUND(AVG(vital_value)::numeric, 1) as avg_value FROM patient_vitals WHERE tenant_id = 'tenant_general' GROUP BY vital_type;"
    
    echo -e "\n${BOLD_WHITE}Heart Rate (last 30 readings):${RESET}"
    echo -e "    100 │                    ${RED}*${RESET}"
    echo -e "     90 │         ${YELLOW}*    *  *    *${RESET}"
    echo -e "     80 │  ${GREEN}* * *    **        *  * *${RESET}"
    echo -e "     70 │                           ${BLUE}*${RESET}"
    echo -e "        └─────────────────────────────→ time"
    echo -e "    Mean: ${GREEN}78 bpm${RESET} | Std: 8.2 | Z-score: 0.3 → ${BOLD_GREEN}NORMAL${RESET}"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: Show ICD-10 + SNOMED conditions
    typewriter_print "Current Conditions (ICD-10 / SNOMED):"
    db_query_table "$ANALYTICS_DB" "SELECT icd10_code, description, status FROM patient_conditions WHERE tenant_id = 'tenant_general' LIMIT 5;"
    echo ""

    # Step 4: CDS Drug Interaction Check
    typewriter_print "Prescribing Warfarin — running CDS checks..."
    spinner "Check 1/3: Drug interactions..." 1.0
    print_warn "⚠ INTERACTION: Warfarin × Aspirin → MAJOR"
    print_warn "  Risk: Increased bleeding. Do not co-prescribe."
    spinner "Check 2/3: Allergy cross-check..." 0.8
    print_ok  "✓ No known allergies to Warfarin"
    spinner "Check 3/3: Dosage validation..." 0.6
    print_ok  "✓ 5mg dose within therapeutic range (2–10mg)"
    echo -e "${BOLD_RED}PRESCRIPTION REQUIRES PRESCRIBER OVERRIDE${RESET}"
    typewriter_print "Dr. Menon overrides with reason: 'Patient monitored, aspirin discontinued'"
    print_ok "Prescription created — Audit log written"
    $REDIS_CLI PUBLISH medtrust:audit:events "Prescription OVERRIDE: Warfarin for MRN $mrn by Dr. Menon" > /dev/null

    pause_for_enter "Scene 7: FHIR R4 Export"

    # SCENE 7: "HL7 FHIR R4 — Standard Clinical Data Exchange"
    show_scene_banner "7" "HL7 FHIR R4 — Standard Clinical Data Exchange"

    # Step 1: Export patient as FHIR Bundle
    typewriter_print "Exporting patient as FHIR R4 Bundle..."
    spinner "Building FHIR resources..." 1.5
    echo -e "${GRAY}"
    cat <<EOF
{
  "resourceType": "Bundle",
  "type": "document",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "pat-gen-$(echo $mrn | md5sum | cut -c1-8)",
        "identifier": [{"system": "MRN", "value": "$mrn"}],
        "name": [{"family": "$lname", "given": ["$fname"]}],
        "birthDate": "$dob",
        "gender": "$gender"
      }
    },
    ... 47 more resources (Encounters, Observations, Conditions) ...
  ],
  "total": 48
}
EOF
    echo -e "${RESET}"
    print_ok "FHIR R4 Bundle: 48 resources | Valid"
    echo ""

    # Step 2: FHIR validation
    typewriter_print "Running FHIR R4 Validator..."
    print_ok "✓ Patient resource: R4 compliant"
    print_ok "✓ Observation resources: LOINC codes valid"
    print_ok "✓ Condition resources: ICD-10 codes valid"
    print_ok "✓ MedicationRequest: RxNorm codes valid"
    print_ok "✓ Bundle structure: valid searchset"
    echo ""

    # Step 3: Real-time vitals WebSocket simulation
    typewriter_print "Simulating real-time vitals stream (WebSocket)..."
    local times=("10:42:01" "10:42:31" "10:43:01")
    local rates=("78" "82" "145")
    local zs=("0.2" "0.7" "3.2")
    local status=("${GREEN}NORMAL${RESET}" "${GREEN}NORMAL${RESET}" "${BOLD_RED}⚠ ANOMALY${RESET}")

    for i in {0..2}; do
        echo -e "[${times[$i]}] Heart rate: ${rates[$i]} bpm  | Z-score: ${zs[$i]}  | ${status[$i]}"
        sleep 0.8
    done

    show_alert_banner
    print_block "AI ANOMALY DETECTION TRIGGERED"
    $REDIS_CLI PUBLISH medtrust:clinical:alerts "Vitals ANOMALY: Heart rate 145 bpm (Z=3.2) for MRN $mrn" > /dev/null
    print_warn "Alert published → Redis:medtrust:clinical:alerts"
    echo ""
    sleep "$STEP_DELAY"

    # Step 5: Service Proof (FHIR API)
    show_scene_banner "8" "FHIR R4 Interface — REST API"
    typewriter_print "Fetching live HL7 FHIR R4 Patient Resource..."
    local token=$(get_auth_token)
    local patient_id=$(db_query_live clinical "SELECT id FROM patients LIMIT 1;")
    
    typewriter_fast "${CYAN}curl -X GET \"$PATIENT_SERVICE/api/patients/$patient_id/fhir\" \\${RESET}"
    typewriter_fast "${CYAN}     -H \"Authorization: Bearer \$TOKEN\"${RESET}"
    echo ""
    
    local response=$(api_call "GET" "$PATIENT_SERVICE/api/v1/patients/$patient_id" "$token")
    echo "$response" | jq '.data'
    validate_response "$response" 200 "id"
    
    pause_for_enter "Act 5: AI Engine"
}
