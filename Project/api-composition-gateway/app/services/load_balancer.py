"""
Health Weighted Load Balancer.
"""
import random
from typing import List, Dict, Any
import redis.asyncio as redis_async
from app.config import settings

class HealthWeightedLoadBalancer:
    def __init__(self):
        self.redis = redis_async.from_url(settings.redis_url)

    async def select_instance(self, service_name: str, instances: List[Dict[str, Any]]) -> Dict[str, Any]:
        from app.observability.metrics import load_balancer_selection_total
        
        valid_instances = [i for i in instances if i.get("circuit_state") != "OPEN" and i.get("weight", 0) > 0]
        
        if not valid_instances:
            raise Exception(f"No valid instances available for {service_name}")
            
        weights = [i.get("weight", 1.0) for i in valid_instances]
        selected = random.choices(valid_instances, weights=weights, k=1)[0]
        
        load_balancer_selection_total.labels(service=service_name, instance=selected["url"]).inc()
        return selected
