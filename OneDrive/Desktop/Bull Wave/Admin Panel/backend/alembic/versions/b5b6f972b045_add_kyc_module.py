"""Add KYC Module

Revision ID: b5b6f972b045
Revises: 
Create Date: 2026-06-05 14:56:26.802808

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b5b6f972b045'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create KYC table
    op.create_table('kyc',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('pan_number', sa.String(), nullable=True),
    sa.Column('pan_holder_name', sa.String(), nullable=True),
    sa.Column('pan_image_url', sa.String(), nullable=True),
    sa.Column('bank_account_name', sa.String(), nullable=True),
    sa.Column('bank_account_number', sa.String(), nullable=True),
    sa.Column('ifsc_code', sa.String(), nullable=True),
    sa.Column('bank_document_url', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('rejection_reason', sa.Text(), nullable=True),
    sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('reviewed_by', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kyc_id'), 'kyc', ['id'], unique=False)
    op.create_index(op.f('ix_kyc_pan_number'), 'kyc', ['pan_number'], unique=True)
    op.create_index(op.f('ix_kyc_user_id'), 'kyc', ['user_id'], unique=True)

    # Create KYCAuditLog table
    op.create_table('kyc_audit_logs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('kyc_id', sa.Integer(), nullable=False),
    sa.Column('action', sa.String(), nullable=False),
    sa.Column('old_status', sa.String(), nullable=True),
    sa.Column('new_status', sa.String(), nullable=True),
    sa.Column('admin_id', sa.Integer(), nullable=False),
    sa.Column('remarks', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['admin_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['kyc_id'], ['kyc.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kyc_audit_logs_id'), 'kyc_audit_logs', ['id'], unique=False)
    op.create_index(op.f('ix_kyc_audit_logs_kyc_id'), 'kyc_audit_logs', ['kyc_id'], unique=False)

    # Modify User table
    op.add_column('user', sa.Column('username', sa.String(), nullable=True))
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_column('user', 'username')
    
    op.drop_index(op.f('ix_kyc_audit_logs_kyc_id'), table_name='kyc_audit_logs')
    op.drop_index(op.f('ix_kyc_audit_logs_id'), table_name='kyc_audit_logs')
    op.drop_table('kyc_audit_logs')

    op.drop_index(op.f('ix_kyc_user_id'), table_name='kyc')
    op.drop_index(op.f('ix_kyc_pan_number'), table_name='kyc')
    op.drop_index(op.f('ix_kyc_id'), table_name='kyc')
    op.drop_table('kyc')
