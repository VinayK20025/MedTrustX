#!/bin/bash
# Seed mock data to unfilled tables for testing purposes

echo "Seeding patients_db on pg-clinical..."
docker exec -i medtrust-pg-clinical psql -U patient_svc -d patients_db <<EOF
SET app.tenant_id = 'tenant_apollo';

INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, blood_group, status)
VALUES 
('MRN-001', 'John', 'Doe', '1980-05-15', 'Male', 'O+', 'active'),
('MRN-002', 'Jane', 'Smith', '1992-11-20', 'Female', 'A-', 'active'),
('MRN-003', 'Robert', 'Johnson', '1975-03-10', 'Male', 'B+', 'active'),
('MRN-004', 'Emily', 'Davis', '2005-08-25', 'Female', 'AB+', 'active'),
('MRN-005', 'Michael', 'Wilson', '1960-12-05', 'Male', 'O-', 'active')
ON CONFLICT (tenant_id, mrn) DO NOTHING;

INSERT INTO audit_log (tenant_id, user_id, action, resource_type, resource_id, details)
VALUES
('tenant_apollo', gen_random_uuid(), 'CREATE', 'Patient', gen_random_uuid(), '{"status": "success"}'),
('tenant_apollo', gen_random_uuid(), 'UPDATE', 'Patient', gen_random_uuid(), '{"status": "success"}')
ON CONFLICT DO NOTHING;
EOF

echo "Seeding scheduling_db.appointments on pg-operational..."
docker exec -i medtrust-pg-operational psql -U appointment_svc -d scheduling_db <<EOF
SET app.tenant_id = 'tenant_apollo';

INSERT INTO appointments (patient_id, doctor_id, department, appointment_type, scheduled_start, scheduled_end, status)
VALUES
(gen_random_uuid(), gen_random_uuid(), 'Cardiology', 'Consultation', NOW() + interval '1 day', NOW() + interval '1 day 1 hour', 'scheduled'),
(gen_random_uuid(), gen_random_uuid(), 'Neurology', 'Follow-up', NOW() + interval '2 days', NOW() + interval '2 days 30 minutes', 'scheduled'),
(gen_random_uuid(), gen_random_uuid(), 'Orthopedics', 'Surgery', NOW() + interval '3 days', NOW() + interval '3 days 4 hours', 'scheduled'),
(gen_random_uuid(), gen_random_uuid(), 'General Practice', 'Checkup', NOW() + interval '4 days', NOW() + interval '4 days 15 minutes', 'scheduled')
ON CONFLICT DO NOTHING;
EOF

echo "Seeding iam_db on pg-iam..."
docker exec -i medtrust-pg-iam psql -U iam_svc -d iam_db <<EOF
SET app.tenant_id = 'tenant_apollo';

INSERT INTO iam_roles (tenant_id, role_name, role_category, description, permissions)
VALUES
('tenant_apollo', 'Doctor', 'Clinical', 'Medical Practitioner', '["read:patient", "write:patient"]'),
('tenant_apollo', 'Nurse', 'Clinical', 'Nursing Staff', '["read:patient", "write:vitals"]')
ON CONFLICT (tenant_id, role_name) DO NOTHING;

INSERT INTO identity_providers (id, tenant_id, provider_name, config)
VALUES
(gen_random_uuid(), 'e430d413-5ba2-475a-a384-5a216c522514', 'Azure AD', '{"client_id": "mock-azure", "enabled": true}'),
(gen_random_uuid(), 'e430d413-5ba2-475a-a384-5a216c522514', 'Okta', '{"client_id": "mock-okta", "enabled": false}')
ON CONFLICT DO NOTHING;
EOF

echo "Seeding audit_db on pg-iam..."
docker exec -i medtrust-pg-iam psql -U audit_svc -d audit_db <<EOF
SET app.tenant_id = 'tenant_apollo';

INSERT INTO audit_events (tenant_id, actor_id, actor_type, action, resource_type, resource_id, outcome, ip_address)
VALUES
('tenant_apollo', gen_random_uuid(), 'User', 'LOGIN', 'System', 'Auth', 'success', '192.168.1.100'),
('tenant_apollo', gen_random_uuid(), 'User', 'LOGOUT', 'System', 'Auth', 'success', '192.168.1.101')
ON CONFLICT DO NOTHING;
EOF

echo "Mock data seeded successfully!"
