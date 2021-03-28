"""empty message

Revision ID: e39f19b99d76
Revises: ab0f0726bed2
Create Date: 2021-03-27 20:53:14.490143

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'e39f19b99d76'
down_revision = 'ab0f0726bed2'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('device', sa.Column('fieldProfileID', sa.Integer(), nullable=True))
    op.add_column('device', sa.Column('team', sa.String(), nullable=True))
    op.create_foreign_key(None, 'device', 'fieldProfile', ['fieldProfileID'], ['id'])
    op.add_column('gameAction', sa.Column('rfidID', sa.Integer(), nullable=True))
    op.add_column('gameAction', sa.Column('time_held', sa.Integer(), nullable=True))
    op.alter_column('gameAction', 'deviceID',
               existing_type=sa.INTEGER(),
               nullable=True)
    op.drop_constraint('gameAction_userID_fkey', 'gameAction', type_='foreignkey')
    op.create_foreign_key(None, 'gameAction', 'rfid', ['rfidID'], ['id'])
    op.drop_column('gameAction', 'userID')
    op.add_column('gameConfig', sa.Column('deviceMap', sa.String(), nullable=True))
    op.add_column('gameConfig', sa.Column('fieldProfileID', sa.Integer(), nullable=False))
    op.add_column('gameConfig', sa.Column('gameTypeID', sa.Integer(), nullable=False))
    op.drop_constraint('gameConfig_userID_fkey', 'gameConfig', type_='foreignkey')
    op.create_foreign_key(None, 'gameConfig', 'fieldProfile', ['fieldProfileID'], ['id'])
    op.create_foreign_key(None, 'gameConfig', 'gameType', ['gameTypeID'], ['id'])
    op.drop_column('gameConfig', 'userID')
    op.add_column('games', sa.Column('gameConfigID', sa.Integer(), nullable=False))
    op.drop_constraint('games_userID_fkey', 'games', type_='foreignkey')
    op.drop_constraint('games_gameTypeID_fkey', 'games', type_='foreignkey')
    op.create_foreign_key(None, 'games', 'gameConfig', ['gameConfigID'], ['id'])
    op.drop_column('games', 'gameTypeID')
    op.drop_column('games', 'userID')
    op.alter_column('maps', 'map_image',
               existing_type=postgresql.BYTEA(),
               nullable=True)
    op.alter_column('maps', 'map_svg',
               existing_type=sa.VARCHAR(),
               nullable=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('maps', 'map_svg',
               existing_type=sa.VARCHAR(),
               nullable=False)
    op.alter_column('maps', 'map_image',
               existing_type=postgresql.BYTEA(),
               nullable=False)
    op.add_column('games', sa.Column('userID', sa.INTEGER(), autoincrement=False, nullable=False))
    op.add_column('games', sa.Column('gameTypeID', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'games', type_='foreignkey')
    op.create_foreign_key('games_gameTypeID_fkey', 'games', 'gameType', ['gameTypeID'], ['id'])
    op.create_foreign_key('games_userID_fkey', 'games', 'users', ['userID'], ['id'])
    op.drop_column('games', 'gameConfigID')
    op.add_column('gameConfig', sa.Column('userID', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'gameConfig', type_='foreignkey')
    op.drop_constraint(None, 'gameConfig', type_='foreignkey')
    op.create_foreign_key('gameConfig_userID_fkey', 'gameConfig', 'users', ['userID'], ['id'])
    op.drop_column('gameConfig', 'gameTypeID')
    op.drop_column('gameConfig', 'fieldProfileID')
    op.drop_column('gameConfig', 'deviceMap')
    op.add_column('gameAction', sa.Column('userID', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'gameAction', type_='foreignkey')
    op.create_foreign_key('gameAction_userID_fkey', 'gameAction', 'users', ['userID'], ['id'])
    op.alter_column('gameAction', 'deviceID',
               existing_type=sa.INTEGER(),
               nullable=False)
    op.drop_column('gameAction', 'time_held')
    op.drop_column('gameAction', 'rfidID')
    op.drop_constraint(None, 'device', type_='foreignkey')
    op.drop_column('device', 'team')
    op.drop_column('device', 'fieldProfileID')
    # ### end Alembic commands ###