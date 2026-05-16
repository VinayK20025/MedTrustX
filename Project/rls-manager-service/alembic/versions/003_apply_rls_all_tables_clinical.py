"""apply rls clinical

Revision ID: 003_clinical_rls
Revises: 002_operational
Create Date: 2026-05-15 00:02:00.000000

"""
from alembic import op
import sqlalchemy as sa
import os

revision = '003_clinical_rls'
down_revision = '002_operational'
branch_labels = None
depends_on = None

def upgrade() -> None:
    script_path = os.path.join(os.path.dirname(__file__), '..', '..', 'migrations', 'clinical', '002_apply_rls.sql')
    with open(script_path, 'r') as f:
        sql = f.read()
        op.execute(sa.text(sql))
            
def downgrade() -> None:
    tables = [
        "patients", "encounters", "observations", "conditions", 
        "medications", "allergies", "procedures", "careplans", "audit_log"
    ]
    for table in tables:
        op.execute(f"DROP POLICY IF EXISTS tenant_isolation ON {table}")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")
