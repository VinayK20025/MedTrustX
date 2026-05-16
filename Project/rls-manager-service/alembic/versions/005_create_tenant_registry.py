"""create tenant registry

Revision ID: 005_tenant_registry
Revises: 004_operational_rls
Create Date: 2026-05-15 00:04:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = '005_tenant_registry'
down_revision = '004_operational_rls'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'tenant_registry',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('tenant_id', UUID(as_uuid=True), unique=True, nullable=False),
        sa.Column('tenant_name', sa.String(128), nullable=False),
        sa.Column('tenant_slug', sa.String(64), unique=True, nullable=False),
        sa.Column('status', sa.String(32), server_default='active'),
        sa.Column('onboarded_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('offboarded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', JSONB, server_default='{}')
    )

def downgrade() -> None:
    op.drop_table('tenant_registry')
