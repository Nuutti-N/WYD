"""add roadmap fields to path

Revision ID: f3a9c1b27d84
Revises: eba9ec74d035
Create Date: 2026-06-14

Adds the rich roadmap content columns to the path table:
difficulty, total_hours, achievements, prerequisites, steps.
All nullable so existing user-created paths are unaffected.
(Mentor proof is computed live from the creator, not stored.)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'f3a9c1b27d84'
down_revision: Union[str, Sequence[str], None] = 'eba9ec74d035'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('path', sa.Column(
        'difficulty', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('path', sa.Column('total_hours', sa.Integer(), nullable=True))
    op.add_column('path', sa.Column('achievements', sa.JSON(), nullable=True))
    op.add_column('path', sa.Column('prerequisites', sa.JSON(), nullable=True))
    op.add_column('path', sa.Column('steps', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('path', 'steps')
    op.drop_column('path', 'prerequisites')
    op.drop_column('path', 'achievements')
    op.drop_column('path', 'total_hours')
    op.drop_column('path', 'difficulty')
