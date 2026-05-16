import os

# Configuration
SERVICES_DIR = "./services"
OUTPUT_DIR = "./infrastructure/k8s/generated"
IMAGE_PREFIX = "ghcr.io/your-github-username/medtrustx"

os.makedirs(OUTPUT_DIR, exist_ok=True)

services = [d for d in os.listdir(SERVICES_DIR) if os.path.isdir(os.path.join(SERVICES_DIR, d))]

template = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {name}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {name}
  template:
    metadata:
      labels:
        app: {name}
    spec:
      containers:
      - name: {name}
        image: {image_prefix}/{name}:latest
        resources:
          limits:
            memory: "128Mi"
            cpu: "100m"
          requests:
            memory: "64Mi"
            cpu: "50m"
---
apiVersion: v1
kind: Service
metadata:
  name: {name}
spec:
  selector:
    app: {name}
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
"""

for service in services:
    with open(f"{OUTPUT_DIR}/{service}.yaml", "w") as f:
        f.write(template.format(name=service, image_prefix=IMAGE_PREFIX))

print(f"✅ Generated {len(services)} Kubernetes manifests in {OUTPUT_DIR}")
