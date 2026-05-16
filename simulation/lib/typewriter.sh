#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Typewriter Effect
# ==============================================================================

# Default delay
: ${TYPEWRITER_DELAY:=0.03}
: ${SPEED_MULTIPLIER:=1.0}

typewriter_print() {
    local text="$1"
    local delay=$(echo "scale=4; $TYPEWRITER_DELAY / $SPEED_MULTIPLIER" | bc)
    
    # Check if text is empty
    if [[ -z "$text" ]]; then
        echo ""
        return
    fi

    # Print character by character
    for (( i=0; i<${#text}; i++ )); do
        echo -ne "${text:$i:1}"
        sleep $delay
    done
    echo ""
}

typewriter_fast() {
    local text="$1"
    local delay=$(echo "scale=4; ($TYPEWRITER_DELAY / 3) / $SPEED_MULTIPLIER" | bc)
    
    for (( i=0; i<${#text}; i++ )); do
        echo -ne "${text:$i:1}"
        sleep $delay
    done
    echo ""
}
