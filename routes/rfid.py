from database import db_session
from models.db_models import Users, RFID

import json
from sqlalchemy import null
from flask import render_template, flash, jsonify, session, request, make_response
from flask import Blueprint

bp = Blueprint('rfid', __name__, url_prefix='')

from datetime import datetime


# To interact and extract data from these API methods use
# requests module
#
# example:
# import requests
#
# PARAMS = {key:val}
# result = requests.get(url = URL, params = PARAMS)
# data = result.json()
#
# DATA = {key:val}
# result = requsts.post(url = URL, data = DATA (or PARAMS...))
#
#    :: For PUT request, include target update row
# result = request.put(url = URL, params = PARAMS)


@bp.route('/resources/rfid', methods=['GET','POST','PUT'])
def node_status():

    """
    API to interact with the RFID table

    GET  - query by node, team, and/or field
    POST - add node to table
    PUT  - update node in table

    :: returns ::       query result
    """

    if request.method == 'GET':

        params = request.args
        result = RFID.query

        rfidID = params.get('id', None)
        uid    = params.get('uid', None)

        if rfidID: result = jsonify(result.get(rfidID))
        if uid:    result = jsonify(result.filter(RFID.uid == uid).first())

        db_session.commit()

        return result


    elif request.method == 'POST':

        params = request.json
        rfid   = RFID(**params)

        default_user = Users.query.get(1)
        default_user.rfids.append(rfid)

        try: db_session.commit()

        except Exception as E:

            db_session.rollback()
            db_session.commit()

            return make_response(f'{E}', 409)

        return jsonify(default_user)


    elif request.method == 'PUT':

        params = request.json

        new_user_id = params.pop('new_user_id', None)
        rfidID      = params.pop('id', None)
        uid         = params.pop('uid', None)

        if rfidID: rfid = RFID.query.get(id)
        if uid:    rfid = RFID.query.filter(RFID.uid == uid).first()

        new_user = Users.query.get(new_user_id)

        if not rfid or not new_user: return make_response('', 204)

        new_user.rfids.append(rfid)

        db_session.commit()

        return jsonify(new_user)


    return make_response('', 204)
