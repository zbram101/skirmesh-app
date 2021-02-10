"""
IRL Systems - Battlefield  (C)

@Author: Brandon Zoss, Dustin Kuchenbecker
@Date:   October, 2020 - Present

Setup and run on any Raspberry Pi model.
This code proves the minimum viable functions of a
nodes from which complex realworld gaming scenarios
can be launched and validated.
"""

from flask import Flask, render_template, flash, jsonify, session
from flask import request, redirect, url_for, make_response
from flask_login import current_user, login_user, LoginManager, logout_user
from flask_login import login_required
from flask_sqlalchemy import SQLAlchemy

import os, glob
from datetime import datetime
from bs4 import BeautifulSoup as SOUP
import time, json

from pretty_print import print_time, print_perc

from dotenv import load_dotenv
load_dotenv(verbose=True)
DATABASE_URL = os.environ['DATABASE_URL']



CMD_ARGS = {'TIME DATA'   : json.load(open("json/timer_values.json")),
            'SET ASSIST %': json.load(open("json/percent_values.json"))}

# print(json.dumps(CMD_ARGS, indent=4, sort_keys=True))

SET_LOCATION = 0xFF
BROADCAST    = "FFFF"


application = Flask(__name__)
application.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
application.secret_key = 'a secret'
loginMngr = LoginManager(application)



DB = SQLAlchemy(application)



# This is awkward but necessary to prevent a circular import
if __name__ == '__main__':

    from db_models import *
    from controller import CONTROL_POINT
    from forms import RegistrationForm, RegisterAccountForm, LoginForm

    serial = '/dev/ttyUSB0'
    baud   = 115200

    CP = CONTROL_POINT(serial, baud, database=DB)

    # Initialize/update the fields table
    for file in map(os.path.basename, glob.glob("templates/fields/*.html")):

        field = file.strip('.html')
        is_field = Field.query.filter(Field.field == field).first()
        if is_field: continue
        DB.session.add(Field(field=field))

    DB.session.commit()



@application.route('/index/update', methods=['GET'])
def update():

    if request.method == 'GET':

        field = session.get('field')
        to_update = dict()

        team_data = json.load(open("json/fields/" + field + ".json"))
        team_cmap = {int(c['value'], 16):c['color'] for c in team_data}

        _field = Field.query.filter(Field.field == field).first()
        nodes = _field.nodes

        for node in nodes:

            if node.config == CP.CAPTURE and node.team and node.location:

                to_update[node.node] = {
                                       'id'    : node.location,
                                       'team'  : node.team,
                                       'color' : team_cmap[node.team],
                                       'stable': node.stable
                                       }

        DB.session.commit()

        if to_update: return make_response(jsonify(to_update), 200)

    return make_response(jsonify(""), 200)



@application.route('/')
@application.route('/index')
def main_page():
    """
    Establish main page.
    """
    kwargs = {'author': "Brandon Zoss and Dustin Kuchenbecker",
              'name'  : "SkirMesh Systems"}

    return render_template('field_chooser.html', **kwargs)



@application.route('/index/<field>')
def field_page(field):
    """
    Establish field landing page.
    """
    session['field'] = field

    # Only leave this in the CONTROLLER branch - so you don't have to
    # go back to the Node Admin page for the field to take effect
    if CP.field != field:
        for node in node_status:
            node.field = field

    CP.field = field

    team_data = json.load(open("json/fields/" + field + ".json"))
    team_cmap = {int(c['value'], 16):c['color'] for c in team_data}
    team_name = {int(n['value'], 16):n['text'] for n in team_data}

    _field = Field.query.filter(Field.field == field).first()

    teams = {}
    for uid in _field.uids if _field else []:
        teams.setdefault(uid.team, []).append(uid)

    kwargs = {'author'     : "Brandon Zoss and Dustin Kuchenbecker",
              'name'       : "SkirMesh Gaming",
              'team_col'   : ['player'],
              'teams'      : [*teams],
              'team_data'  : teams,
              'team_cmap'  : team_cmap,
              'team_name'  : team_name,
               }

    DB.session.commit()

    return render_template('fields/' + field + '.html', **kwargs)



@application.route('/registration', methods=['POST','GET'])
def registration():

    form = RegisterAccountForm(request.form)

    if request.method == 'POST' and form.validate():

        data = {'username':form.username.data,
                'email'   :form.email.data,
                'password':form.password.data,
               }

        try:

            users = Player(**data)
            DB.session.add(users)
            DB.session.commit()

            flash("Account Successfully Created")
            return redirect(url_for('main_page'))

        except Exception as E:

            error = 'That account already exists'
            flash(error)

        finally:

            DB.session.commit()

            return render_template('registration.html', form=form, error=error)

    return render_template('registration.html', form=form)



@application.route('/login', methods=['POST','GET'])
def login():

    if current_user.is_authenticated:
        return redirect(url_for('main_page'))

    form = LoginForm()

    if form.validate_on_submit():

        user = Player.query.filter_by(callsign=form.callsign.data).first()
        DB.session.commit()

        if not user or not user.check_password(form.password.data):

            error = 'Oops! There was an invalid callsign or password.'
            flash(error)

            return render_template('login.html', form=form, error=error)

        login_user(user)

        return redirect(url_for('main_page'))

    return render_template('login.html', form=form)



@application.route('/register', methods=['POST','GET'])
def register():

    if current_user.is_authenticated:
        return redirect(url_for('index'))

    error = None
    form = RegisterAccountForm()

    if request.method == "POST" and form.validate_on_submit():

        user = Player(callsign=form.callsign.data,
                      email=form.email.data,
                      firstname=form.firstname.data,
                      lastname=form.lastname.data)

        user.set_password(form.password.data)

        try:

            DB.session.add(user)
            flash("Congrats, you're in!")

        except:

            error = 'Oops! You seem to have matching information in our database...'
            print(error)
            flash(error)

        finally:

            DB.session.commit()

            if not error:

                return redirect(url_for('main_page'))

    return render_template('register.html', form=form, error=error)



@application.route('/logout')
def logout():

    logout_user()

    return redirect(url_for('main_page'))



@application.route('/players')
def players():

    field = session.get('field', None)

    team_data = json.load(open("json/fields/" + field + ".json")) if field else []
    team_cmap = {int(c['value'], 16):c['color'] for c in team_data}
    team_name = {int(n['value'], 16):n['text'] for n in team_data}

    _field = Field.query.filter(Field.field == field).first()
    reg_teams = set([uid.team for uid in _field.uids]) if _field else set()

    teams = {}
    for uid in _field.uids if _field else []:
        teams.setdefault(uid.team, []).append(uid)

    _teams = Team.query.filter(Team.team.in_(teams.keys())).all()

    team_times = {t.team:sum((s.time_held if s.field == field and s.time_held else 0) for s in t.scores) for t in _teams}
    team_score = {t.team:sum((s.points if s.field == field and s.points else 0) for s in t.scores) for t in _teams}
    plyr_score = {u:sum((s.points if s.field == field and s.points else 0) for s in u.scores) for u in (_field.uids if _field else [])}


    nd_times = {}
    for node in _field.nodes if _field else []:

        times = {}
        for s in node.scores:
            times.setdefault(s.team, []).append(s.time_held or 0)

        nd_times[node] = times

        # Add time for nodes that are still under control
        begin = get_time_capture_complete(node.node)
        if node.stable and not get_is_capture_closed(node.node) and begin:

            for team in times:

                if team == node.team:

                    held  = int((datetime.now() - begin).total_seconds())

                    times[team].append(held)
                    team_times[team] += held

    for node in nd_times:
        for team in nd_times[node]:
            nd_times[node][team] = sum(nd_times[node][team])

    kwargs = {'t_sc_cols'  : ['team', 'points', 'time'],
              'team_score' : team_score,
              'p_sc_cols'  : ['player', 'points'],
              'plyr_score' : plyr_score,
              'nodes'      : _field.nodes if _field else [],
              't_tm_cols'  : ['team', 'time'],
              'team_times' : team_times,
              'nd_tm_cols' : ['team', 'time'],
              'node_times' : nd_times,
              # 'players'    : players,
              'print_time' : print_time,
              'team_name'  : team_name,
              'team_cmap'  : team_cmap,
              'teams'      : reg_teams,
              'field'      : field,
              }

    DB.session.commit()

    return render_template('players.html', **kwargs)



@application.route('/user_reg', methods=['POST', 'GET'])
def user_reg(uid=None):

    players = Player.query.order_by(Player.lastname.asc()).all()
    DB.session.commit()

    return render_template('user_reg.html', Players=players)



from digi.xbee.models.address import XBee64BitAddress

@application.route('/node_admin')
def node_admin():

    field = session.get('field', None)

    if not field:

        error = "Please select a Field and return to Node Admin"
        flash(error)

        return render_template('field_chooser.html', error=error)

    avail_addr = [str(xb.get_64bit_addr()) for xb in CP.XB_net.get_devices()]
    node_status = NodeStatus.query.filter(NodeStatus.node.in_(avail_addr)).all()

    # Use this to update the field status and ensure nodes are on the
    # right field, but I don't want to do it all the time...need a better way
    if CP.field != field:
        for node in node_status:
            node.field = field

    CP.field = field

    soup = SOUP(open('templates/fields/' + field + '.html'), 'html.parser')
    paths = soup.find_all('path')
    loc_json = json.dumps([{"text":path['id'],"value":(0,0)} for path in paths] + [{"text":"SWAP","value":(0,0)}])

    # Pull specific arguments for the field
    CMD_ARGS['SET LOCATION'] = json.loads(loc_json)
    field_cmd_args = json.load(open("json/fields/" + field + ".json"))
    CMD_ARGS['REGISTER'] = CMD_ARGS['SET_LOCATION'] = CMD_ARGS['SET TEAM'] = field_cmd_args

    kwargs = {
             'cmd_dict'    : CP.CMD_DICT if CP.end_nodes else None,
             'cmd_args'    : CMD_ARGS,
             'node_cols'   : ['node id','location','config',
                              'Capture\nTime','Medic\nTime','Bomb\nFUS  |  ARM  |  DIS',
                              'Capture\nAssist %'],
             'node_status' : node_status,
             'print_time'  : print_time,
             'print_perc'  : print_perc,
             'field'       : field,
             }

    DB.session.commit()

    return render_template('node_admin.html', **kwargs)
    # return render_template('fields/' + field +'.html', admin=True, **kwargs)



@application.route('/node_admin/issue_command', methods=['POST'])
def issue_command():

    data = json.loads(request.data)
    field = session.get('field')

    if request.method == 'POST':

        dest   = data['dest']
        config = data['conf']
        args   = data['args']
        button = data['button']

        avail_addr = [str(xb.get_64bit_addr()) for xb in CP.XB_net.get_devices()]

        pkt    = bytearray(3)
        pkt[0] = CP.CONFIGURE
        pkt[1] = int(config, 16)

        if int(config, 16) == SET_LOCATION and dest != BROADCAST:

            print(f"Setting {dest} Location to: {data['location']}")

            data = {'location' : data['location'],
                    'node'     : dest,
                    'field'    : field}

            node = NodeStatus.query.filter(NodeStatus.node == dest).first()
            if node:
                node.field     = field
                node.location  = data['location']
            else: DB.session.add(NodeStatus(**data))

            DB.session.commit()


        elif button == 'Issue Command':

            pkt[2]  = int(args, 16)
            _config = int(config, 16)

            # If just setting the configuration for one node
            if _config in CP.CONFIGURATIONS:

                if dest == BROADCAST:

                    nodes = NodeStatus.query.filter(NodeStatus.node.in_(avail_addr)).all()

                    for node in nodes:

                        node.config = _config

                        if _config == CP.REGISTER:

                            node.team = pkt[2]

                        if _config == CP.CAPTURE:

                            node.team = None

                else:

                    data = {'config'   : _config,
                            'node'     : dest,
                            'field'    : field}

                    node = NodeStatus.query.filter(NodeStatus.node == dest).first()
                    if node:

                        node.config    = _config

                        if _config == CP.REGISTER:
                            node.team = pkt[2]
                            data['team'] = pkt[2]

                        if _config == CP.CAPTURE:
                            node.team = None

                    else: DB.session.add(NodeStatus(**data))

                DB.session.commit()

            # Shift the pkt left to remove reconfigure command byte when
            # setting attributes like timers
            if CP.CAPT_TIME <= _config <= CP.ARM_TIME:

                pkt.pop(0)

                val_map = {CP.CAPT_TIME:'cap_time',
                           CP.BOMB_TIME:'bomb_time',
                           CP.MED_TIME :'med_time',
                           CP.CAP_PERC :'cap_asst',
                           CP.DIFF_TIME:'diff_time',
                           CP.ARM_TIME :'arm_time'}

                val, arg = _config, int(args, 16)

                if dest == BROADCAST:

                    nodes = NodeStatus.query.filter(NodeStatus.node.in_(avail_addr)).all()

                    for node in nodes:

                        setattr(node, val_map[val], arg)

                else:

                    data = {'node':dest, val_map[val]:arg, 'field':field}

                    node = NodeStatus.query.filter(NodeStatus.node == dest).first()
                    if node: setattr(node, val_map[val], arg)
                    else: DB.session.add(NodeStatus(**data))

                DB.session.commit()

            # Set medic times globally, because all nodes are handled the
            # same at the controller level
            if _config == CP.MED_TIME:

                print(f"Updating MEDIC TIME to {pkt[1]*10} seconds")

                # Return here because nothing gets sent to the node for this
                return make_response(jsonify({"message": "OK"}), 200)

            # Blast a few necessary commands to push the node into a
            # specicic capture configuration
            if _config == CP.SET_TEAM:

                if dest == BROADCAST:

                    nodes = NodeStatus.query.filter(NodeStatus.node.in_(avail_addr)).all()

                    for node in nodes:

                        node.team      = pkt[2]
                        node.stable    = 1
                        node.cap_time  = 6

                        data = {'node':node.node, 'team':pkt[2], 'field':field, 'action':'CAPTURE'}
                        DB.session.add(Score(**data))

                    CP.send_data_broadcast(bytearray([CP.CAPT_TIME, 0]))
                    CP.send_data_broadcast(bytearray([CP.CAPTURE, pkt[2]]))
                    CP.send_data_broadcast(bytearray([CP.CAPT_TIME, 6]))

                else:

                    data = {'node':dest, 'team':pkt[2], 'field':field, 'action':'CAPTURE'}
                    DB.session.add(Score(**data))

                    data = {'node':dest,'team':pkt[2]}
                    node = NodeStatus.query.filter(NodeStatus.node == dest).first()
                    if node:
                        node.team      = pkt[2]
                        node.stable    = 1
                        node.cap_time  = 6
                    else: DB.session.add(NodeStatus(**data))

                    _64bit_addr = CP.XB_net.get_device_by_64(XBee64BitAddress.from_hex_string(dest))

                    CP.transmit_pkt(_64bit_addr, bytearray([CP.CAPT_TIME, 0]))
                    CP.transmit_pkt(_64bit_addr, bytearray([CP.CAPTURE, pkt[2]]))
                    CP.transmit_pkt(_64bit_addr, bytearray([CP.CAPT_TIME, 6]))

                DB.session.commit()
                # Return here to prevent sending the final
                return make_response(jsonify({"message": "OK"}), 200)


            if dest == BROADCAST:

                print(f"BROADCASTING: ", *pkt)

                CP.send_data_broadcast(pkt)

            else:

                print(f"Sending {dest}:", *pkt)
                _64bit_addr = XBee64BitAddress.from_hex_string(dest)
                CP.transmit_pkt(CP.XB_net.get_device_by_64(_64bit_addr), pkt)


        elif button == 'End Game':

            nodes = NodeStatus.query.filter(NodeStatus.node.in_(avail_addr)).all()

            for node in nodes:

                if node.stable:

                    begin  = get_time_capture_complete(node.node)
                    closed = get_is_capture_closed(node.node)

                    print(begin, closed, node)

                    # If a capture started and was not closed out normally
                    # then close it out
                    if begin and not closed:

                        held  = int((datetime.now() - begin).total_seconds())

                        tdat = {'node':node.node,'team':node.team,'field':field,'time_held':held,'action':'END GAME'}
                        DB.session.add(Score(**tdat))

                        print(f"Ended timer count for {node.node}")

            DB.session.commit()


        elif button == 'Start Game':

            _field = Field.query.filter(Field.field == field).first()

            teams = {}
            for uid in _field.uids if _field else []:
                teams.setdefault(uid.team, []).append(uid)

            _teams = Team.query.filter(Team.team.in_(teams.keys())).all()

            team_times = {t.team:sum((s.time_held if s.field == field and s.time_held else 0) for s in t.scores) for t in _teams}
            team_score = {t.team:sum((s.points if s.field == field and s.points else 0) for s in t.scores) for t in _teams}
            plyr_score = {u:sum((s.points if s.field == field and s.points else 0) for s in u.scores) for u in (_field.uids if _field else [])}


            nd_times = {}
            for node in _field.nodes if _field else []:

                times = {}
                for s in node.scores:
                    times.setdefault(s.team, []).append(s.time_held or 0)

                nd_times[node] = times

                # Add time for nodes that are still under control
                begin = get_time_capture_complete(node.node)
                if node.stable and not get_is_capture_closed(node.node) and begin:

                    for team in times:

                        if team == node.team:

                            held  = int((datetime.now() - begin).total_seconds())

                            times[team].append(held)
                            team_times[team] += held

                if node.config == CP.CAPTURE:

                    node.team = None;

                    _64bit_addr = CP.XB_net.get_device_by_64(XBee64BitAddress.from_hex_string(node.node))
                    CP.transmit_pkt(_64bit_addr, bytearray([CP.CONFIGURE, CP.CAPTURE]))

            for node in nd_times:
                for team in nd_times[node]:
                    nd_times[node][team] = sum(nd_times[node][team])


            DB.session.commit()

            team_data = json.load(open("json/fields/" + field + ".json"))
            team_name = {int(n['value'], 16):n['text'] for n in team_data}

            data = {'field'        :field,
                    'teams'        :str(_teams),
                    'team_name_map':str(team_name),
                    'times_by_team':str(team_times),
                    'times_by_node':str(nd_times),
                    'score_by_team':str(team_score),
                    'score_by_uid' :str(plyr_score),
                    }

            DB.session.add(Game(**data))
            DB.session.commit()

            # Delete the scores table data for the next game
            # use try/except to allow a rollback option if it gets sideways
            try:
                q = Score.query.filter(Score.node.in_(avail_addr))
                q.delete(synchronize_session='fetch')
                DB.session.commit()
            except Exception as E:
                print(E)
                DB.session.rollback()


        elif button == 'Discover Network':

            print("Discovering Network")
            CP.find_nodes()

    DB.session.commit()

    return make_response(jsonify({"message": "OK"}), 200)



@application.route('/comms')
def comms_log():

    kwargs = {'cols_data' : CommsData.__table__.columns.keys(),
              'data_data' : CommsData.query.order_by(CommsData.id.desc()).all(),
              'datetime'  : datetime,
              'time_disp' : CP.TIME_DISP,
             }

    return render_template('comms.html', **kwargs)



# TODO: Make this a listener function and just pop the UID if it gets one
@application.route('/user_reg/get_uid', methods=['POST','GET'])
def get_uid():

    while not CP.user_reg:

        pass

    uid = CP.user_reg
    CP.user_reg = None

    return make_response(jsonify({"uid": uid}), 200)



# TODO: I have no idea if all this still works
@application.route('/user_reg/assign_uid', methods=['POST'])
def assign_uid():

    data = json.loads(request.data)
    error = None

    if request.method == 'POST':

        player = data['player']
        uid = data['uid']

    data = {'id'  : player,
            'uid' : uid,
           }

    try:

        _uid        = UID.query.filter(UID.uid == uid).first()
        _uid.player = Player.query.filter(Player.id == player).first()

    except:

        error = 'UID already assigned to player'
        flash(error)
        print(error)

    finally:

        DB.session.commit()

        if error:

            return render_template('user_reg.html', error=error)

    return redirect(url_for('user_reg'))



@application.route('/player_profile/<callsign>')
@login_required
def player_profile(callsign):

    user = Player.query.filter_by(callsign=callsign).first()
    DB.session.commit()

    return render_template('player_profile.html', user=user)



@loginMngr.user_loader
def load_user(id):

    user = Player.query.get(int(id))
    DB.session.commit()

    return user




if __name__ == '__main__':

    print("Initializing host controller")

    t = time.monotonic()
    while not CP.end_nodes and (time.monotonic() - t) < 10:

        CP.find_nodes()

    # Configure and start the flask application
    application.jinja_env.auto_reload = True
    application.config['TEMPLATES_AUTO_RELOAD'] = True
    application.run(host='0.0.0.0')
