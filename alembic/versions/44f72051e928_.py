"""empty message

Revision ID: 44f72051e928
Revises: e39f19b99d76
Create Date: 2021-03-27 21:16:42.163798

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '44f72051e928'
down_revision = 'e39f19b99d76'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('device', sa.Column('gameID', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'device', 'games', ['gameID'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'device', type_='foreignkey')
    op.drop_column('device', 'gameID')
    # ### end Alembic commands ###