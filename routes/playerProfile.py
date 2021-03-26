from database import db_session
from models.db_models import Users, PlayerProfile, FieldProfile

from sqlalchemy import null
from flask import render_template, flash, jsonify, session, request, make_response
from flask import Blueprint

bp = Blueprint('playerProfile', __name__, url_prefix='')


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


@bp.route('/resources/playerProfile', methods=['GET','POST','PUT'])
def node_status():

    """
    API to interact with the PlayerProfile table

    GET  - query by userID
    POST - add node to table
    PUT  - update node in table

    :: returns ::       query result
    """

    if request.method == 'GET':

        params = request.args
        result = Users.query

        userID = params.get('id', None)

        if userID: result = jsonify(result.get(userID))
        else:      result = make_response('Query with User ID', 409)

        db_session.commit()

        return result

    # Player Profiles are generated when the User is created
    # elif request.method == 'POST':
    elif request.method == 'PUT':

        params = request.json
        userID = params.pop('id', None)

        if userID: user = Users.query.get(userID)

        if not user: return make_response('', 204)

        for attr in params:

            setattr(user.playerProfile, attr, params[attr])

        db_session.commit()

        return jsonify(user)


    return make_response('', 204)
