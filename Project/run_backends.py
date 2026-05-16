import os
import sys
import glob
import subprocess
import signal
import time
import argparse
from concurrent.futures import ThreadPoolExecutor

# ANSI color codes for log prefixes
COLORS = [
    '\033[94m', '\033[92m', '\033[93m', '\033[95m', '\033[96m', 
    '\033[91m', '\033[34m', '\033[32m', '\033[33m', '\033[35m', '\033[36m'
]
RESET = '\033[0m'

processes = []

def find_services(base_paths):
    """Find all directories containing a src/main.py file."""
    services = []
    for base_path in base_paths:
        if not os.path.exists(base_path):
            continue
        
        for entry in os.listdir(base_path):
            full_path = os.path.join(base_path, entry)
            if os.path.isdir(full_path):
                main_py = os.path.join(full_path, "src", "main.py")
                if os.path.exists(main_py):
                    services.append(full_path)
    return sorted(services)

def stream_output(pipe, prefix, color):
    """Stream subprocess output with a colorized prefix."""
    for line in iter(pipe.readline, b''):
        try:
            text = line.decode('utf-8').rstrip()
            print(f"{color}[{prefix}]{RESET} {text}")
        except Exception:
            pass

def start_service(service_path, port, index):
    """Start a single FastAPI service using uvicorn."""
    service_name = os.path.basename(service_path)
    color = COLORS[index % len(COLORS)]
    
    print(f"{color}Starting {service_name} on port {port}...{RESET}")
    
    cmd = [
        sys.executable, "-m", "uvicorn", 
        "src.main:app", 
        "--host", "0.0.0.0", 
        "--port", str(port)
    ]
    
    # Read config to find which DB it uses
    env = os.environ.copy()
    config_path = os.path.join(service_path, "src", "config.py")
    if os.path.exists(config_path):
        with open(config_path, "r") as f:
            content = f.read()
            # Map DBs
            env["DB_HOST"] = "localhost"
            if "pg-iam" in content:
                env["DB_PORT"] = "5434"
            elif "pg-clinical" in content:
                env["DB_PORT"] = "5432"
            else:
                env["DB_PORT"] = "5433"
            
            # Extract Redis URL to replace 'redis:6379' with localhost
            import re
            redis_match = re.search(r'REDIS_URL[^"]+"(redis://[^"]+)"', content)
            if redis_match:
                orig_url = redis_match.group(1)
                # Redis requires password 'redis_secret_2026'
                new_url = orig_url.replace("redis://redis:6379", "redis://:redis_secret_2026@localhost:6379")
                env["REDIS_URL"] = new_url
            
            # Map Kafka
            env["KAFKA_BROKERS"] = "localhost:19092"
            env["OPA_URL"] = "http://localhost:8181"

    # We set cwd to the service directory so imports like 'src.main' work correctly
    p = subprocess.Popen(
        cmd,
        cwd=service_path,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )
    
    processes.append(p)
    
    # Stream logs in the current thread
    stream_output(p.stdout, service_name, color)

def cleanup(signum, frame):
    """Gracefully terminate all running subprocesses."""
    print("\n\033[91mShutting down all services...\033[0m")
    for p in processes:
        try:
            if sys.platform == 'win32':
                p.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                p.terminate()
        except Exception:
            pass
            
    # Wait for processes to exit
    for p in processes:
        try:
            p.wait(timeout=3)
        except subprocess.TimeoutExpired:
            p.kill()
            
    print("All services stopped.")
    sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="MedTrustX Microservice Orchestrator")
    parser.add_argument("--include", type=str, help="Comma-separated list of service substrings to run (e.g. 'patient,clinical,icu')")
    parser.add_argument("--exclude", type=str, help="Comma-separated list of service substrings to skip")
    parser.add_argument("--max", type=int, default=10, help="Maximum number of services to start (default 10, to prevent system crash)")
    parser.add_argument("--base-port", type=int, default=8000, help="Starting port number")
    
    args = parser.parse_args()
    
    # Base directories containing services
    roots = ["services", "infrastructure"]
    all_services = find_services(roots)
    
    if not all_services:
        print("No services found with 'src/main.py'. Are you in the project root?")
        return
        
    filtered_services = all_services
    
    # Apply includes
    if args.include:
        includes = args.include.split(",")
        filtered_services = [s for s in filtered_services if any(inc.lower() in os.path.basename(s).lower() for inc in includes)]
        
    # Apply excludes
    if args.exclude:
        excludes = args.exclude.split(",")
        filtered_services = [s for s in filtered_services if not any(exc.lower() in os.path.basename(s).lower() for exc in excludes)]
        
    if not filtered_services:
        print("No services matched the filters.")
        return
        
    # Cap maximum services to prevent melting the user's PC
    if len(filtered_services) > args.max:
        print(f"\033[93mWARNING: Found {len(filtered_services)} services. Limiting to first {args.max} to prevent memory exhaustion.\033[0m")
        print("Use --max to increase this limit, or use --include to target specific services.")
        filtered_services = filtered_services[:args.max]
        
    print(f"\033[92mStarting {len(filtered_services)} services...\033[0m")
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    # Use ThreadPoolExecutor to run blocking subprocess stream reads concurrently
    with ThreadPoolExecutor(max_workers=len(filtered_services)) as executor:
        for i, service_path in enumerate(filtered_services):
            port = args.base_port + i
            executor.submit(start_service, service_path, port, i)
            # Short sleep to prevent port contention / CPU spike on mass-startup
            time.sleep(0.5)
            
    # Wait indefinitely
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        pass # Handled by signal handler

if __name__ == "__main__":
    main()
