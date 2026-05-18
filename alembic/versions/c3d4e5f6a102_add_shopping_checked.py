"""add checked to shopping_lists

Revision ID: c3d4e5f6a102
Revises: b2c3d4e5f601
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'c3d4e5f6a102'
down_revision = 'b2c3d4e5f601'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('shopping_lists', sa.Column('checked', sa.Boolean(), nullable=False, server_default='false'))


def downgrade():
    op.drop_column('shopping_lists', 'checked')
