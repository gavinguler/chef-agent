"""add image_url to recipes

Revision ID: 004
Revises: 003
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('recipes', sa.Column('image_url', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('recipes', 'image_url')
