import os
import re
import subprocess

db_names = set()
services_dir = "/root/MedTrustX/Project/services"

for root_dir, _, files in os.walk(services_dir):
    if "config.py" in files:
        with open(os.path.join(root_dir, "config.py"), "r") as f:
            content = f.read()
            match = re.search(r'DB_NAME[^"]+"([^"]+)"', content)
            if match:
                db_names.add(match.group(1))

print(f"Found {len(db_names)} unique databases to ensure exist...")

for db in db_names:
    print(f"Creating {db}...")
    cmd = f"docker exec medtrust-pg-operational psql -U medtrust_ops_admin -d postgres -c \"CREATE DATABASE {db};\""
    subprocess.run(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
print("Done creating databases via docker exec.")
