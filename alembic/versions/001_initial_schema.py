"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-03 13:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create recipes table
    op.create_table(
        'recipes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('naam', sa.Text(), nullable=False),
        sa.Column('beschrijving', sa.Text(), nullable=True),
        sa.Column('instructies', sa.Text(), nullable=True),
        sa.Column('kcal', sa.Integer(), nullable=True),
        sa.Column('eiwit_g', sa.Float(), nullable=True),
        sa.Column('vet_g', sa.Float(), nullable=True),
        sa.Column('koolhydraten_g', sa.Float(), nullable=True),
        sa.Column('categorie', sa.String(length=50), nullable=True),
        sa.Column('vlees_type', sa.String(length=50), nullable=True),
        sa.Column('bron', sa.String(length=50), nullable=True, server_default='handmatig'),
        sa.Column('aangemaakt_op', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create meal_plans table
    op.create_table(
        'meal_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cyclus_week', sa.Integer(), nullable=False),
        sa.Column('dag', sa.String(length=20), nullable=False),
        sa.Column('maaltijd_type', sa.String(length=20), nullable=False),
        sa.Column('recept_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['recept_id'], ['recipes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create shopping_lists table
    op.create_table(
        'shopping_lists',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cyclus_week', sa.Integer(), nullable=False),
        sa.Column('product', sa.Text(), nullable=False),
        sa.Column('categorie', sa.String(length=50), nullable=True),
        sa.Column('hoeveelheid', sa.Text(), nullable=True),
        sa.Column('winkel', sa.String(length=50), nullable=True, server_default='lidl'),
        sa.Column('prijs_indicatie', sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create freezer_items table
    op.create_table(
        'freezer_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cyclus_week', sa.Integer(), nullable=False),
        sa.Column('product', sa.Text(), nullable=False),
        sa.Column('hoeveelheid', sa.Text(), nullable=True),
        sa.Column('ontdooi_dag', sa.String(length=20), nullable=True),
        sa.Column('gebruik_dag', sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create nutrition_cycle table
    op.create_table(
        'nutrition_cycle',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cyclus_week', sa.Integer(), nullable=False),
        sa.Column('vlees_type', sa.String(length=50), nullable=False),
        sa.Column('hoeveelheid_g', sa.Integer(), nullable=False),
        sa.Column('gebruikt', sa.Boolean(), nullable=True, server_default='false'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cyclus_week')
    )


def downgrade() -> None:
    op.drop_table('nutrition_cycle')
    op.drop_table('freezer_items')
    op.drop_table('shopping_lists')
    op.drop_table('meal_plans')
    op.drop_table('recipes')
