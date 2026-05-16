"""Script to emit random Redis events for the pub/sub pane."""
import os
import sys
import time
import json
import random

sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))

from data import redis_client as redis

def main() -> None:
    """Emit random events to Redis channels."""
    if not redis.ping():
        print("Redis not available.")
        sys.exit(1)

    print("Starting Redis event emitter...")
    channels = [
        "medtrust:audit:events",
        "medtrust:zta:alerts",
        "medtrust:clinical:alerts",
        "medtrust:gateway:threats"
    ]

    try:
        while True:
            chan = random.choice(channels)
            event = {
                "timestamp": int(time.time()),
                "source": "sim_emitter",
                "severity": random.choice(
                    ["INFO", "WARN", "CRITICAL"]),
                "message": "System event generated",
                "metadata": {"val": random.randint(1,100)}
            }
            if "audit" in chan:
                event["message"] = "Resource accessed"
                event["severity"] = "INFO"
            elif "zta" in chan:
                event["message"] = "Device posture change"
            elif "threat" in chan:
                event["message"] = "WAF rule triggered"

            # Occasionally emit
            if random.random() < 0.3:
                redis.publish(chan, json.dumps(event))

            time.sleep(2.0)
    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == "__main__":
    main()
