import uuid, random, json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text

OPERATIONAL_URL = "postgresql://medtrust_ops_admin:operational_db_secret_2026@localhost:5433/scheduling_db"
engine = create_engine(OPERATIONAL_URL)
now = datetime.utcnow()

print("=== Creating API Gateway tables ===")
with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS api_request_logs (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            request_id      VARCHAR(64) UNIQUE NOT NULL,
            timestamp       TIMESTAMP WITH TIME ZONE NOT NULL,
            method          VARCHAR(8) NOT NULL,
            path            VARCHAR(256) NOT NULL,
            service         VARCHAR(64),
            origin_ip       VARCHAR(15),
            status_code     INT,
            latency_ms      INT,
            request_size_b  INT,
            response_size_b INT,
            gateway         VARCHAR(32),
            tenant_id       VARCHAR(64),
            is_anomalous    BOOLEAN DEFAULT FALSE
        );
        CREATE TABLE IF NOT EXISTS threat_logs (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            timestamp       TIMESTAMP WITH TIME ZONE NOT NULL,
            threat_type     VARCHAR(64) NOT NULL,
            source_ip       VARCHAR(15),
            target_endpoint VARCHAR(256),
            requests_per_min INT,
            threshold       INT,
            action_taken    VARCHAR(32),
            waf_rule        VARCHAR(64),
            blocked         BOOLEAN DEFAULT TRUE,
            details         JSONB
        );
        CREATE TABLE IF NOT EXISTS otel_traces (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trace_id        VARCHAR(32) NOT NULL,
            span_id         VARCHAR(16) NOT NULL,
            parent_span_id  VARCHAR(16),
            operation       VARCHAR(128),
            service         VARCHAR(64),
            duration_ms     INT,
            status          VARCHAR(16),
            started_at      TIMESTAMP WITH TIME ZONE,
            attributes      JSONB
        );
    """))
    conn.commit()
print("  Tables created.")

ENDPOINTS = [
    ("/api/patients",               "patient-service",  "GET",  200, 45,  120),
    ("/api/patients/{id}/records",  "patient-service",  "GET",  200, 87,  340),
    ("/api/appointments",           "clinical-service", "GET",  200, 38,   90),
    ("/api/appointments",           "clinical-service", "POST", 201, 55,   60),
    ("/api/iam/auth/login",         "iam-service",      "POST", 200, 120,  50),
    ("/api/iam/auth/refresh",       "iam-service",      "POST", 200, 35,   30),
    ("/api/ai/predict-readmission", "ai-service",       "POST", 200, 340, 200),
    ("/api/audit/logs",             "audit-service",    "GET",  200, 55,  600),
    ("/api/zta/device/verify",      "zta-service",      "POST", 200, 95,   40),
]
GATEWAYS = ["kong-prod-1", "kong-prod-2", "kong-prod-3"]
TENANTS  = ["tenant_general", "tenant_outpatient", "tenant_apollo"]
ddos_start = now - timedelta(hours=24)
ddos_end   = ddos_start + timedelta(minutes=10)

print("\n=== Seeding 72 hours of API request logs ===")
total_requests = 0
with engine.connect() as conn:
    for hour in range(72):
        hour_start  = now - timedelta(hours=72 - hour)
        hour_of_day = hour_start.hour
        if 8 <= hour_of_day <= 20:
            req_count = random.randint(800, 1200)
        elif 6 <= hour_of_day <= 8 or 20 <= hour_of_day <= 22:
            req_count = random.randint(300, 600)
        else:
            req_count = random.randint(50, 150)
        is_ddos_hour = ddos_start <= hour_start <= ddos_end
        if is_ddos_hour:
            req_count = random.randint(8000, 12000)
        batch = []
        for _ in range(req_count):
            ep = random.choice(ENDPOINTS)
            path, service, method, base_status, base_latency, base_resp = ep
            ts = hour_start + timedelta(seconds=random.randint(0, 3600))
            if is_ddos_hour and random.random() > 0.3:
                status_code  = 429
                latency_ms   = random.randint(5, 20)
                is_anomalous = True
            else:
                status_code  = base_status if random.random() > 0.05 else random.choice([400, 401, 403, 500])
                latency_ms   = max(5, int(random.gauss(base_latency, base_latency * 0.2)))
                is_anomalous = False
            batch.append({
                "request_id":      str(uuid.uuid4())[:16],
                "timestamp":       ts.isoformat(),
                "method":          method,
                "path":            path,
                "service":         service,
                "origin_ip":       f"10.{random.randint(0,3)}.{random.randint(1,254)}.{random.randint(1,254)}",
                "status_code":     status_code,
                "latency_ms":      latency_ms,
                "request_size_b":  random.randint(200, 2048),
                "response_size_b": base_resp + random.randint(-50, 200),
                "gateway":         random.choice(GATEWAYS),
                "tenant_id":       random.choice(TENANTS),
                "is_anomalous":    is_anomalous
            })
        for r in batch:
            conn.execute(text("""
                INSERT INTO api_request_logs (
                    request_id, timestamp, method, path, service,
                    origin_ip, status_code, latency_ms,
                    request_size_b, response_size_b,
                    gateway, tenant_id, is_anomalous
                ) VALUES (
                    :request_id, :timestamp, :method, :path, :service,
                    :origin_ip, :status_code, :latency_ms,
                    :request_size_b, :response_size_b,
                    :gateway, :tenant_id, :is_anomalous
                ) ON CONFLICT (request_id) DO NOTHING
            """), r)
        conn.commit()
        total_requests += len(batch)
        if hour % 12 == 0:
            print(f"  Hour {hour+1}/72 — {total_requests} requests so far...")
print(f"  Total API requests: {total_requests}")

print("\n=== Seeding threat logs ===")
threats = (
    [{"timestamp": (ddos_start + timedelta(seconds=i*10)).isoformat(),
      "threat_type": "ddos_burst", "source_ip": "203.0.113.99",
      "target_endpoint": "/api/patients",
      "requests_per_min": random.randint(2800,3500), "threshold": 500,
      "action_taken": "ip_blocked", "waf_rule": "RATE_LIMIT_001",
      "blocked": True, "details": json.dumps({"burst_index": i})}
     for i in range(60)] +
    [{"timestamp": (now - timedelta(hours=36, seconds=i*18)).isoformat(),
      "threat_type": "credential_stuffing",
      "source_ip": f"198.51.{random.randint(1,254)}.{random.randint(1,254)}",
      "target_endpoint": "/api/iam/auth/login",
      "requests_per_min": random.randint(180,220), "threshold": 30,
      "action_taken": "account_locked", "waf_rule": "BRUTE_FORCE_002",
      "blocked": True, "details": json.dumps({"failed_attempts": random.randint(3,8)})}
     for i in range(200)] +
    [{"timestamp": (now - timedelta(hours=48, minutes=i*3)).isoformat(),
      "threat_type": "sql_injection",
      "source_ip": f"192.0.2.{random.randint(1,254)}",
      "target_endpoint": "/api/patients",
      "requests_per_min": random.randint(10,30), "threshold": 0,
      "action_taken": "request_blocked", "waf_rule": "OWASP_SQLI_001",
      "blocked": True, "details": json.dumps({"payload": "OR 1=1"})}
     for i in range(25)]
)
with engine.connect() as conn:
    for t in threats:
        conn.execute(text("""
            INSERT INTO threat_logs (
                timestamp, threat_type, source_ip, target_endpoint,
                requests_per_min, threshold, action_taken,
                waf_rule, blocked, details
            ) VALUES (
                :timestamp, :threat_type, :source_ip, :target_endpoint,
                :requests_per_min, :threshold, :action_taken,
                :waf_rule, :blocked, CAST(:details AS jsonb)
            )
        """), t)
    conn.commit()
print(f"  Inserted {len(threats)} threat events")

print("\n=== Seeding OpenTelemetry traces ===")
TRACE_TEMPLATES = [
    [("gateway.route","kong-gateway",None,8),("iam.verify_token","iam-service",0,35),
     ("zta.device_trust","zta-service",0,28),("patient.get_record","patient-service",0,45),
     ("db.query.patients","postgres",3,18)],
    [("gateway.route","kong-gateway",None,6),("iam.verify_token","iam-service",0,32),
     ("ai.predict_readmission","ai-service",0,280),("tf.serving.inference","tf-serving",2,245),
     ("db.query.observations","postgres",2,22)],
    [("gateway.route","kong-gateway",None,7),("iam.verify_token","iam-service",0,30),
     ("audit.write_log","audit-service",0,15),("db.insert.audit_log","postgres",2,8)],
]
trace_rows = []
for _ in range(500):
    template   = random.choice(TRACE_TEMPLATES)
    trace_id   = uuid.uuid4().hex[:32]
    span_ids   = [uuid.uuid4().hex[:16] for _ in template]
    started_at = now - timedelta(hours=random.randint(1,72))
    for i, (operation, service, parent_idx, base_dur) in enumerate(template):
        trace_rows.append({
            "id":             str(uuid.uuid4()),
            "trace_id":       trace_id,
            "span_id":        span_ids[i],
            "parent_span_id": span_ids[parent_idx] if parent_idx is not None else None,
            "operation":      operation,
            "service":        service,
            "duration_ms":    max(1, int(random.gauss(base_dur, base_dur*0.15))),
            "status":         "OK" if random.random() > 0.03 else "ERROR",
            "started_at":     (started_at + timedelta(milliseconds=i*10)).isoformat(),
            "attributes":     json.dumps({"tenant": random.choice(TENANTS), "env": "production"})
        })
with engine.connect() as conn:
    for r in trace_rows:
        conn.execute(text("""
            INSERT INTO otel_traces (
                id, trace_id, span_id, parent_span_id, operation,
                service, duration_ms, status, started_at, attributes
            ) VALUES (
                :id, :trace_id, :span_id, :parent_span_id, :operation,
                :service, :duration_ms, :status, :started_at,
                CAST(:attributes AS jsonb)
            )
        """), r)
    conn.commit()
print(f"  Inserted {len(trace_rows)} trace spans")

print("\n=== Verification ===")
with engine.connect() as conn:
    total_req = conn.execute(text("SELECT COUNT(*) FROM api_request_logs")).scalar()
    ddos_reqs = conn.execute(text("SELECT COUNT(*) FROM api_request_logs WHERE status_code=429")).scalar()
    p99_lat   = conn.execute(text("SELECT PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) FROM api_request_logs")).scalar()
    threats_t = conn.execute(text("SELECT COUNT(*) FROM threat_logs")).scalar()
    ddos_t    = conn.execute(text("SELECT COUNT(*) FROM threat_logs WHERE threat_type=\'ddos_burst\'")).scalar()
    sqli_t    = conn.execute(text("SELECT COUNT(*) FROM threat_logs WHERE threat_type=\'sql_injection\'")).scalar()
    cred_t    = conn.execute(text("SELECT COUNT(*) FROM threat_logs WHERE threat_type=\'credential_stuffing\'")).scalar()
    traces_t  = conn.execute(text("SELECT COUNT(*) FROM otel_traces")).scalar()
    errors_t  = conn.execute(text("SELECT COUNT(*) FROM otel_traces WHERE status=\'ERROR\'")).scalar()
print(f"  api_request_logs   : {total_req}")
print(f"    429 rate-limited : {ddos_reqs}  <- DDoS proof")
print(f"    p99 latency      : {round(p99_lat)}ms")
print(f"  threat_logs        : {threats_t}")
print(f"    ddos_burst       : {ddos_t}")
print(f"    sql_injection    : {sqli_t}")
print(f"    credential_stuff : {cred_t}")
print(f"  otel_traces        : {traces_t} spans")
print(f"    errors           : {errors_t}")
print("\nAPI Gateway seeding complete!")
