"""add step_proofs to pathpurchase

Revision ID: c4d8e1f6a2b9
Revises: b7e2d4f81a30
Create Date: 2026-06-18

Adds a JSON column that stores Proof of Work: a map of step index (string key)
to the proof URL the user submitted for that step. A step counts as completed
once it has a proof, and step i+1 stays locked until step i has one.
Nullable so existing enrollments are unaffected (treated as {} in code).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d8e1f6a2b9'
down_revision: Union[str, Sequence[str], None] = 'b7e2d4f81a30'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('pathpurchase', sa.Column(
        'step_proofs', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('pathpurchase', 'step_proofs')
