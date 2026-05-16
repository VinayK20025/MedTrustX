import urllib.request
import urllib.error
import json
import uuid

def request(method, path, data=None):
    url = f"http://localhost:8000{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("X-Tenant-ID", "tenant_apollo")
    req.add_header("X-User-Role", "attending_doctor")
    if data:
        req.data = json.dumps(data).encode("utf-8")
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Error {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_flow():
    print("1. Testing Health")
    health = request("GET", "/health")
    print(f"Health: {health}\n")

    user_id = str(uuid.uuid4())
    print("2. Submitting Clinical Emergency Request (Auto-Approve)")
    req_data = {
        "user_id": user_id,
        "justification": "Patient experiencing cardiac arrest",
        "policy_name": "clinical_emergency",
        "context": {
            "emergency_type": "life_critical",
            "patient_id": "patient-123",
            "user_role": "attending_doctor"
        },
        "mfa_verified": True
    }
    created_req = request("POST", "/break-glass/request", req_data)
    print(f"Request Response: {json.dumps(created_req, indent=2)}\n")
    
    if not created_req:
        return
        
    req_id = created_req["id"]
    status = created_req["status"]
    
    if status == "approved":
        print(f"3. Request {req_id} was auto-approved. Activating session...")
        session = request("POST", f"/break-glass/{req_id}/activate")
        print(f"Session Response: {json.dumps(session, indent=2)}\n")
        
        session_id = session["id"] if session else None
        
        if session_id:
            print("4. Fetching Audit Trail")
            audit = request("GET", f"/break-glass/audit?session_id={session_id}")
            print(f"Audit Trail: {json.dumps(audit, indent=2)}\n")
    else:
        print(f"Request status is {status}, not approved.")

if __name__ == "__main__":
    test_flow()
