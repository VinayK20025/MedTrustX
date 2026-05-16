"""apply rls operational

Revision ID: 004_operational_rls
Revises: 003_clinical_rls
Create Date: 2026-05-15 00:03:00.000000

"""
from alembic import op
import sqlalchemy as sa
import os

revision = '004_operational_rls'
down_revision = '003_clinical_rls'
branch_labels = None
depends_on = None

def upgrade() -> None:
    script_path = os.path.join(os.path.dirname(__file__), '..', '..', 'migrations', 'operational', '002_apply_rls.sql')
    with open(script_path, 'r') as f:
        sql = f.read()
        op.execute(sa.text(sql))
            
def downgrade() -> None:
    tables = [
        "appointments", "consent_registry", "access_review_snapshots", 
        "api_request_logs", "threat_logs", "otel_traces"
    ]
    for table in tables:
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation ON {table}")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
