"""
Merge and transform responses.
"""
from typing import Dict, Any, List

class ResponseMerger:
    @staticmethod
    def merge_patient_dashboard(results: List[Any], spec: List[Dict[str, Any]]) -> Dict[str, Any]:
        data = {}
        for res, req in zip(results, spec):
            key = req.get("key")
            if isinstance(res, Exception):
                data[key] = {"error": str(res)}
            else:
                data[key] = res
        return data

    @staticmethod
    def merge_clinical_summary(results: List[Any], spec: List[Dict[str, Any]]) -> Dict[str, Any]:
        data = {}
        for res, req in zip(results, spec):
            key = req.get("key")
            data[key] = res if not isinstance(res, Exception) else {"error": str(res)}
        return data

    @staticmethod
    def merge_admin_overview(results: List[Any], spec: List[Dict[str, Any]]) -> Dict[str, Any]:
        data = {}
        for res, req in zip(results, spec):
            key = req.get("key")
            data[key] = res if not isinstance(res, Exception) else {"error": str(res)}
        return data
