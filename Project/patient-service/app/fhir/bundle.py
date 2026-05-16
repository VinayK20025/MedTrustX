"""
FHIR Bundle Builder.
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

def build_document_bundle(patient_resource: Dict[str, Any], other_resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    entries = [{"resource": patient_resource}]
    entries.extend([{"resource": res} for res in other_resources])
    
    return {
        "resourceType": "Bundle",
        "type": "document",
        "entry": entries
    }
