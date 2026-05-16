"""
Hash Chain Engine.
"""
import hashlib
import json
from typing import Dict, Any

def compute_hash(event: Dict[str, Any]) -> str:
    created_at_str = ""
    if "created_at" in event and event["created_at"]:
        created_at_str = event["created_at"].isoformat() if hasattr(event["created_at"], "isoformat") else str(event["created_at"])
    
    details_str = json.dumps(event.get("details", {}), sort_keys=True)
    
    content = f"{event.get('id', '')}{event.get('tenant_id', '')}{event.get('user_id', '')}" \
              f"{event.get('action', '')}{event.get('resource_type', '')}{event.get('resource_id', '')}" \
              f"{details_str}{event.get('ip_address', '')}{created_at_str}{event.get('previous_hash', '')}"
              
    return hashlib.sha256(content.encode()).hexdigest()
