"""add unique constraint to checkout

Revision ID: add_unique_constraint_to_checkout
Revises: 
Create Date: 2023-12-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_unique_constraint_to_checkout'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop existing checkouts to avoid conflicts
    op.execute("DELETE FROM document_checkouts")
    
    # Drop existing foreign key
    op.drop_constraint('document_checkouts_document_id_fkey', 'document_checkouts', type_='foreignkey')
    
    # Add unique constraint and recreate foreign key
    op.create_unique_constraint('uq_document_checkouts_document_id', 'document_checkouts', ['document_id'])
    op.create_foreign_key('document_checkouts_document_id_fkey', 'document_checkouts', 'documents', ['document_id'], ['id'])


def downgrade() -> None:
    # Drop unique constraint
    op.drop_constraint('uq_document_checkouts_document_id', 'document_checkouts', type_='unique')
