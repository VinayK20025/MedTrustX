"""
FHIR Bundle Generator for Clinical Resources.
"""
from typing import List, Dict, Any

def build_searchset_bundle(resources: List[Dict[str, Any]], total: int, link_self: str) -> Dict[str, Any]:
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": total,
        "link": [
            {
                "relation": "self",
                "url": link_self
            }
        ],
        "entry": [{"resource": res} for res in resources]
    }
