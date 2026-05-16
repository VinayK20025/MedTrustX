"""Main entry point for MedTrustX DHOS Python simulation."""
import sys
from config import IDX
from core import tmux
from data import data_index
from acts import (act1_startup, act2_rls, act3_zta,
                  act4_clinical, act5_ai, act6_grc,
                  act7_gateway)

def main() -> None:
    """Run full simulation sequence."""
    if len(sys.argv) > 1 and sys.argv[1] == "--cleanup":
        tmux.kill_session()
        sys.exit(0)

    # 1. Pre-fetch live data to ensure accuracy
    data_index.detect_live_services()
    data_index.prefetch_data_index()

    # 2. Run acts sequentially
    act1_startup.run()
    act2_rls.run()
    act3_zta.run()
    act4_clinical.run()
    act5_ai.run()
    act6_grc.run()
    act7_gateway.run()

if __name__ == "__main__":
    main()
