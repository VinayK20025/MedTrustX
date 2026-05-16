from locust import HttpUser, task, between, events
import random
from uuid import uuid4

class RLSVerifyUser(HttpUser):
    wait_time = between(0.05, 0.15)
    
    def on_start(self):
        self.tenant_id = "e540de79-f14e-51c6-a6fc-fdf5b103e687"
        self.headers = {"Authorization": "Bearer mock-token"}
        
    @task
    def verify_isolation(self):
        with self.client.get(
            f"/api/rls/tenants/{self.tenant_id}/verify", 
            headers=self.headers,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if not data.get("overall_passed"):
                    response.failure(f"Isolation failure detected: {data.get('failed_tables')}")
                else:
                    response.success()
            else:
                response.failure(f"HTTP Error: {response.status_code}")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    if environment.stats.total.failures > 0:
        print("CRITICAL: Isolation failures detected during load test!")
