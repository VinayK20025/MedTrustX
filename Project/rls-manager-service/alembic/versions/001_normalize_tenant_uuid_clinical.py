"""normalize tenant uuid clinical

Revision ID: 001_clinical
Revises: 
Create Date: 2026-05-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
import os

revision = '001_clinical'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    script_path = os.path.join(os.path.dirname(__file__), '..', '..', 'migrations', 'clinical', '001_normalize_uuid.sql')
    with open(script_path, 'r') as f:
        sql = f.read()
        op.execute(sa.text(sql))
            
def downgrade() -> None:
    tables = [
        "patients", "encounters", "observations", "conditions", 
        "medications", "allergies", "procedures", "careplans", "audit_log"
    ]
    for table in tables:
        op.drop_index(f"idx_{table}_tenant_uuid", table_name=table)
        op.alter_column(table, 'tenant_id', new_column_name='tenant_uuid')
        op.alter_column(table, 'tenant_id_legacy', new_column_name='tenant_id')
        op.drop_column(table, 'tenant_uuid')
