"""HTTP REST API client using requests library."""
import time
import requests
from typing import Optional
from config import SERVICES, API_TIMEOUT
from core.colors import print_ok, print_warn, print_api_call

_live_services: dict[str, bool] = {}
_demo_token: str = ""

def set_token(token: str) -> None:
    """Set the demo auth token."""
    global _demo_token
    _demo_token = token

def _headers() -> dict:
    """Build common request headers."""
    return {
        "Authorization": f"Bearer {_demo_token}",
        "Content-Type":  "application/json",
        "X-Demo-Mode":   "true",
    }

def health_check(service_key: str) -> bool:
    """Check if service is reachable via /health."""
    url = SERVICES.get(service_key, "")
    if not url:
        return False
    try:
        resp = requests.get(f"{url}/health",
                            timeout=2)
        alive = resp.status_code == 200
        _live_services[service_key] = alive
        return alive
    except Exception:
        _live_services[service_key] = False
        return False

def is_live(service_key: str) -> bool:
    """Return cached liveness status."""
    return _live_services.get(service_key, False)

def get(service_key: str, path: str,
        show_call: bool = True) -> Optional[dict]:
    """GET request to microservice."""
    url = SERVICES.get(service_key, "")
    if not url or not is_live(service_key):
        return None
    full_url = f"{url}{path}"
    if show_call:
        print_api_call("GET", full_url)
    try:
        start = time.time()
        resp = requests.get(full_url,
                            headers=_headers(),
                            timeout=API_TIMEOUT)
        latency = int((time.time() - start) * 1000)
        if resp.status_code == 200:
            print_ok(f"HTTP 200 | {latency}ms [LIVE API]")
            return resp.json()
        else:
            print_warn(f"HTTP {resp.status_code}")
            return None
    except Exception as e:
        print_warn(f"API call failed: {e}")
        return None

def post(service_key: str, path: str,
         body: dict,
         show_call: bool = True) -> Optional[dict]:
    """POST request to microservice."""
    url = SERVICES.get(service_key, "")
    if not url or not is_live(service_key):
        return None
    full_url = f"{url}{path}"
    if show_call:
        print_api_call("POST", full_url)
    try:
        import json
        start = time.time()
        resp = requests.post(full_url,
                             headers=_headers(),
                             json=body,
                             timeout=API_TIMEOUT)
        latency = int((time.time() - start) * 1000)
        if resp.status_code in (200, 201):
            print_ok(f"HTTP {resp.status_code} | "
                     f"{latency}ms [LIVE API]")
            return resp.json()
        else:
            print_warn(f"HTTP {resp.status_code}")
            return None
    except Exception as e:
        print_warn(f"API call failed: {e}")
        return None

def waf_test(url_with_payload: str) -> int:
    """Test WAF by sending malicious payload.
    Returns HTTP status code."""
    try:
        resp = requests.get(url_with_payload,
                            headers=_headers(),
                            timeout=3)
        return resp.status_code
    except Exception:
        return 0
