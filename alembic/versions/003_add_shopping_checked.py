"""add checked to shopping_lists

Revision ID: 003
Revises: 002
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('shopping_lists', sa.Column('checked', sa.Boolean(), nullable=False, server_default='false'))


def downgrade():
    op.drop_column('shopping_lists', 'checked')
