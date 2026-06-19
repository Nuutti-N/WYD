"""add completed_steps to pathpurchase

Revision ID: b7e2d4f81a30
Revises: f3a9c1b27d84
Create Date: 2026-06-16

Adds a JSON column that remembers which roadmap steps a user has checked off
for a path they enrolled in. Steps are tracked by their index in Path.steps.
Nullable so existing enrollments are unaffected (treated as [] in code).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e2d4f81a30'
down_revision: Union[str, Sequence[str], None] = 'f3a9c1b27d84'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('pathpurchase', sa.Column(
        'completed_steps', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('pathpurchase', 'completed_steps')
