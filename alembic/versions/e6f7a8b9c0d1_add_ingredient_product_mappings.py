"""add ingredient_product_mappings

Revision ID: e6f7a8b9c0d1
Revises: c5134693b6b0
Create Date: 2026-05-20 19:30:00.000000
"""
from typing import Union
from alembic import op
import sqlalchemy as sa

revision: str = 'e6f7a8b9c0d1'
down_revision: Union[str, None] = 'c5134693b6b0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'ingredient_product_mappings',
        sa.Column('ingredient_name', sa.Text(), nullable=False),
        sa.Column('bonnetjes_product_id', sa.Integer(), nullable=False),
        sa.Column('bonnetjes_product_name', sa.Text(), nullable=False),
        sa.Column('aangemaakt_op', sa.DateTime(), nullable=False,
                  server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('ingredient_name'),
    )


def downgrade() -> None:
    op.drop_table('ingredient_product_mappings')
