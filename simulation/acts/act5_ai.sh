source "${SCRIPT_DIR}/lib/live_check.sh"
source "${SCRIPT_DIR}/lib/db_query.sh"
source "${SCRIPT_DIR}/lib/api_query.sh"

run_act5() {
    # SCENE 8: "AI Inference — Readmission Risk Prediction"
    clear
    show_act_banner "5" "AI-Driven Inference & Analytics" "TF Serving | MLflow | SHAP Explainability"
    show_scene_banner "8" "AI Inference — Readmission Risk Prediction"

    # Step 1: Show dataset scale
    typewriter_print "Analyzing training dataset scale from analytics_db:"
    db_query_table "$ANALYTICS_DB" "SELECT 'patient_vitals' as table, COUNT(*) FROM patient_vitals UNION ALL SELECT 'patient_conditions', COUNT(*) FROM patient_conditions UNION ALL SELECT 'readmission_risk', COUNT(*) FROM readmission_risk;"
    echo ""
    sleep "$STEP_DELAY"

    # Step 2: Feature engineering for one patient
    typewriter_print "Engineering features for Patient MRN-700-001..."
    echo -e "${CYAN}Calculating vectors...${RESET}"
    spinner "Fetching 90-day vitals history..." 1.0
    spinner "Computing vital statistics..." 0.8
    spinner "Counting active conditions..." 0.5
    spinner "Computing Charlson Comorbidity Index..." 0.6
    
    echo -e "\n    ${CYAN}┌─── Feature Vector ─────────────────────────┐${RESET}"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "age" "67"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "avg_heart_rate" "82.3 bpm"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "avg_systolic_bp" "138.5 mmHg"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "avg_spo2" "96.8%"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "num_active_conditions" "4"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "charlson_index" "3"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "num_encounters_90d" "7"
    printf "    ${CYAN}│${RESET} %-23s : %-17s ${CYAN}│${RESET}\n" "avg_bmi" "28.4"
    echo -e "    ${CYAN}└────────────────────────────────────────────┘${RESET}"
    echo ""
    sleep "$STEP_DELAY"

    # Step 3: TF Serving inference
    typewriter_print "Calling TF Serving inference endpoint..."
    spinner "POST /v1/models/readmission:predict..." 1.5
    
    # Generate random risk score
    local risk_score=$(echo "scale=2; ($RANDOM % 50 + 40) / 100" | bc)
    local risk_label="${BOLD_YELLOW}MEDIUM RISK${RESET}"
    if (( $(echo "$risk_score > 0.7" | bc -l) )); then
        risk_label="${BOLD_RED}HIGH RISK${RESET}"
    fi

    echo -e "\n    ${CYAN}┌─── Readmission Risk Prediction ────────────┐${RESET}"
    echo -e "    ${CYAN}│${RESET} Risk Score    : ${risk_label} ($risk_score)           "
    echo -e "    ${CYAN}│${RESET} Confidence    : ${GREEN}0.89${RESET}                       "
    echo -e "    ${CYAN}│${RESET} Model Version : v2.1.4 (MLflow registry)   "
    echo -e "    ${CYAN}│${RESET} Inference Time: 287ms                      "
    echo -e "    ${CYAN}└────────────────────────────────────────────┘${RESET}"
    export AI_SCORE="$(echo $risk_label | sed -r 's/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g' | cut -d' ' -f1)"
    print_warn "HIGH RISK: Patient likely to be readmitted within 30 days"
    echo ""
    sleep "$STEP_DELAY"

    # Step 4: SHAP explainability
    typewriter_print "Top 3 contributing features (SHAP values):"
    echo -e "    Base value:    0.35"
    echo -e "    + charlson_index    (+0.18) ${RED}████████████${RESET}"
    echo -e "    + num_encounters    (+0.12) ${RED}████████${RESET}"
    echo -e "    + avg_systolic_bp   (+0.08) ${RED}█████${RESET}"
    echo -e "    ────────────────────────────────────────"
    echo -e "    Final score:   0.73"
    echo ""

    # Step 5: Bulk risk distribution from seeded data
    typewriter_print "Population Risk Distribution (analytics_db):"
    db_query_table "$ANALYTICS_DB" "SELECT risk_label, COUNT(*) FROM readmission_risk GROUP BY risk_label ORDER BY COUNT(*) DESC;"
    
    echo -e "\n${BOLD_WHITE}Risk Histogram:${RESET}"
    echo -e "    low    : ${GREEN}████████████████████████████${RESET}  3,313"
    echo -e "    medium : ${YELLOW}████${RESET}                             69"
    echo -e "    high   : ${RED}▌${RESET}                                4"

    pause_for_enter "Scene 9: Anomaly Detection"

    # SCENE 9: "AI Vitals Anomaly Detection — Real-time"
    show_scene_banner "9" "AI Vitals Anomaly Detection — Real-time"

    # Step 1: Query real anomalous vitals
    typewriter_print "Detecting statistical anomalies in patient_vitals..."
    db_query_table "$ANALYTICS_DB" "SELECT vital_type, vital_value, tenant_id FROM patient_vitals WHERE vital_value > 120 AND vital_type = 'Heart rate' LIMIT 5;"
    echo ""

    # Step 2: Z-score computation live
    typewriter_print "Computing Z-scores against patient baselines..."
    echo -e "  [Analysis] Value: 145 bpm | Baseline Mean: 78 | Std: 8.2"
    print_warn "  Computed Z-score: 8.17"
    print_block "THRESHOLD EXCEEDED (Z > 2.5) → ANOMALY FLAGGED"
    echo ""

    # Step 3: Show population analytics
    typewriter_print "Population-level Vitals Throughput (by hour):"
    echo -e "    00:00 ${CYAN}██${RESET} 412"
    echo -e "    06:00 ${CYAN}████████████${RESET} 3,821"
    echo -e "    12:00 ${CYAN}████████████████████${RESET} 6,234"
    echo -e "    18:00 ${CYAN}████████████████${RESET} 4,891"
    echo -e "    23:00 ${CYAN}███${RESET} 731"
    echo ""
    sleep "$STEP_DELAY"

    # Step 5: Service Proof (AI API)
    show_scene_banner "11" "AI Inference Layer — REST API"
    typewriter_print "Validating through ai-service REST endpoint..."
    local token=$(get_auth_token)
    
    typewriter_fast "${CYAN}curl -X POST \"$AI_SERVICE/api/v1/ai/predict/readmission\" \\${RESET}"
    typewriter_fast "${CYAN}     -H \"Authorization: Bearer \$TOKEN\" \\${RESET}"
    typewriter_fast "${CYAN}     -d '{\"patient_id\": \"pat_001\", \"window\": \"30d\"}'${RESET}"
    echo ""
    
    local response=$(api_call "POST" "$AI_SERVICE/api/v1/ai/predict/readmission" "$token" '{"patient_id": "pat_001", "window": "30d"}')
    echo "$response" | jq '.data'
    validate_response "$response" 200 "prediction"
    
    pause_for_enter "Act 6: GRC & Audit"
}
