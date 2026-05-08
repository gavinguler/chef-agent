"""add notification_settings table

Revision ID: 002
Revises: 001
Create Date: 2026-05-08 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notification_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("daily_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("daily_hour", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("daily_minute", sa.Integer(), nullable=False, server_default="30"),
        sa.Column("shopping_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("shopping_days", sa.String(100), nullable=False, server_default="woensdag,zaterdag"),
        sa.Column("shopping_hour", sa.Integer(), nullable=False, server_default="8"),
        sa.Column("shopping_minute", sa.Integer(), nullable=False, server_default="0"),
    )
    # Insert default row
    op.execute(
        "INSERT INTO notification_settings (id, daily_enabled, daily_hour, daily_minute, "
        "shopping_enabled, shopping_days, shopping_hour, shopping_minute) "
        "VALUES (1, true, 7, 30, true, 'woensdag,zaterdag', 8, 0)"
    )


def downgrade() -> None:
    op.drop_table("notification_settings")
