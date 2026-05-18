"""add image_url to recipes

Revision ID: d4e5f6a1b203
Revises: c3d4e5f6a102
Create Date: 2026-05-08
"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a1b203'
down_revision = 'c3d4e5f6a102'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('recipes', sa.Column('image_url', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('recipes', 'image_url')
