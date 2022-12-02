# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask, request, render_template, flash, redirect, url_for, make_response, request
# pymongo database 
from pymongo import MongoClient
# json library to handle json objects
from bson.json_util import loads, dumps
# import database.py
import database
# import simple_websocket
import simple_websocket

from secrets import token_urlsafe

# Mongo Setup
mongo_client = MongoClient("mongo")
db = mongo_client["WebWizards"]

# users attributes: {"user_id":"","email":"","username":"","password":"","hashed_auth_token":"","active":"","lobby":"","best_score":""}
# more will be added once more user attributes decided for game
users_collection = db["users"]
users_id_collection = db["user_id"]
lobby_collection = db['lobby_info']
game_collection = db['game_info']

# keep track of the websockets each user is using
user_websockets = {}
game_websockets = {}

# code from Jesse's Lecture on HTML Injection
def escape_html(comment):
    stripped = comment.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")
    return stripped


# Flask Setup
app = Flask(__name__)
app.config['SECRET_KEY'] = '3333333333'
app.config['SOCK_SERVER_OPTIONS'] = {'ping_interval': 5}


@app.route("/", methods=["GET"])
def index():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return render_template("index.html")
    else:
        return redirect('/hub')


# this path is used when cookies need to be set before requesting hub
@app.route("/get-hub", methods=["GET"])
def gethub():
    return redirect('/hub')


# Receive GET request to user's hub
# sends of user dictionary with profile info
@app.route("/hub", methods=["GET"])
def hub():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        info = {"name": request_info['username'], "score": request_info['score']}
        leaderboard = database.get_leaderboard(users_collection)
        all_lobbies = lobby_collection.find({})
        users_to_join = []
        for lobby in all_lobbies:
            if len(lobby['members']) == 1:
                users_to_join.append(lobby['members'][0])
        return render_template("hub.html", user=loads(dumps(info)), leaderboard=leaderboard, lobbies=users_to_join)


# Receive POST request for registering
@app.route('/register', methods=["POST"])
def register_user():
    # request email input with name = reg_email in HTML form
    email = request.form.get("reg_email")
    # request username input with name = reg_username in HTML form
    username = request.form.get("reg_username")
    # need to escape username
    username = escape_html(username)
    # request password input with name then validate password
    password = request.form.get("reg_password")
    re_password = request.form.get("re-enter")
    warning = database.validate_pw(password, re_password)
    if not (warning is None):
        flash(warning)
        return redirect('/')
    # calls function to check if email and username are already used
    unique = database.check_unique(email, username, users_collection)

    if unique == "Unique":
        auth_token = database.add_user(email, username, password, users_collection)
        # redirect to get-hub that way browser has chance to set auth cookie
        resp = make_response(redirect('/get-hub'))
        resp.headers['Set-Cookie'] = 'auth_token=' + auth_token + '; HttpOnly'
        return resp
    elif unique == "Username":
        flash('Username already taken.')
        return redirect('/')
    elif unique == "Email":
        flash('Email already being used.')
        return redirect('/')
    return redirect('/')


# Receive POST request for login
@app.route('/login', methods=["POST"])
def login():
    # request username input with name = log_username in HTML form
    username = request.form.get("log_username")
    # need to escape username
    username = escape_html(username)
    # request password input with name = log_password in HTML form
    password = request.form.get("log_password")

    # calls function to find if user exists
    user = database.find_user(username, password, users_collection)

    if user:
        # generate new auth_token and set as cookie
        auth_token = database.gen_new_auth_token(username, users_collection)
        resp = make_response(redirect('/get-hub'))
        resp.headers['Set-Cookie'] = 'auth_token=' + auth_token + '; HttpOnly'
        return resp
    else:
        flash('Invalid Username or Password!')
        return redirect('/')


# # Receive GET request for logout
# @app.route('/logout', methods=["post"])
# def logout():
#     return redirect('/')


@app.route("/lobby", methods=["GET"])
def createLobby():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        lobby_token = token_urlsafe(16)
        member = request_info['username']
        users_collection.update_one({'username': member}, {"$set": {'lobby_id': lobby_token}})
        lobby_collection.insert_one({'lobby_id': lobby_token, 'members': [member]})
        return render_template("lobby.html", member=member)


@app.route("/join-lobby", methods=["POST"])
def joinLobby():
    request_info = database.is_valid_user(request, users_collection)
    joiner = request_info['username']
    if not request_info['valid']:
        return redirect('/')
    else:
        host_info = users_collection.find_one({'username': request.form['lobby_host']})
        if 'lobby_id' in host_info.keys():
            if host_info['lobby_id']:
                lobby = host_info['lobby_id']
                users_collection.update_one({'username': joiner}, {"$set": {'lobby_id': lobby}})
                members = lobby_collection.find_one({'lobby_id': lobby})['members']
                members.append(joiner)
                lobby_collection.update_one({'lobby_id': lobby}, {"$set": {'members': members}})
                return render_template("lobby.html", member=joiner)
        return redirect('/')


@app.route('/lobby-websocket', websocket=True)
def lobby_websckt():
    ws = simple_websocket.Server(request.environ)
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        ws.close()
        return
    user = request_info['username']
    user_websockets[user] = ws
    userinfo = users_collection.find_one({'username': user})
    if not ('lobby_id' in userinfo.keys()) or not userinfo['lobby_id']:
        ws.close()
        return
    lobby_id = userinfo['lobby_id']
    lobby_members = lobby_collection.find_one({'lobby_id': lobby_id})['members']
    for member in lobby_members:
        if member != user:
            if member in user_websockets.keys():
                if user_websockets[member]:
                    user_websockets[member].send(user)
                    ws.send(member)
    try:
        while True:
            data = ws.receive()
            if data == 'start_game':
                # print(data)
                lobby_members = lobby_collection.find_one({'lobby_id': lobby_id})['members']
                for member in lobby_members:
                    if member != user:
                        if member in user_websockets.keys():
                            if user_websockets[member]:
                                user_websockets[member].send('send to new game')
    except simple_websocket.ConnectionClosed:
        # print('here')
        users_collection.update_one({'username': user}, {"$set": {'lobby_id': None}})
        user_websockets[user] = None
        lobby_members = lobby_collection.find_one({'lobby_id': lobby_id})['members']
        if len(lobby_members) == 1:
            lobby_collection.delete_one({'lobby_id': lobby_id})
            # print('deleted')
        else:
            for member in lobby_members:
                if member != user:
                    if member in user_websockets.keys():
                        if user_websockets[member]:
                            user_websockets[member].send('')
            lobby_members.remove(request_info['username'])
            lobby_collection.update_one({'lobby_id': lobby_id}, {"$set": {'members': lobby_members}})
    return ''


@app.route("/game", methods=["GET"])
def game():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        return render_template("game.html", username=request_info['username'])


@app.route("/create-game", methods=["GET"])
def create_game():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        player = request_info['username']
        userinfo = users_collection.find_one({'username': player})
        if userinfo and 'lobby_id' in userinfo.keys():
            lobby_id = userinfo['lobby_id']
            lobby_members = lobby_collection.find_one({'lobby_id': lobby_id})['members']
            game_token = token_urlsafe(16)
            for member in lobby_members:
                users_collection.update_one({'username': member}, {"$set": {'game_id': game_token}})
            game_collection.insert_one({'game_id': game_token, 'members': lobby_members})
            return 'game created'
        else:
            return


@app.route("/validate-new-game", methods=["GET"])
def game_validation():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        user = request_info['username']
        userinfo = users_collection.find_one({'username': user})
        if userinfo and 'lobby_id' in userinfo.keys():
            lobby_id = userinfo['lobby_id']
            lobby_members = lobby_collection.find_one({'lobby_id': lobby_id})['members']
            if len(lobby_members) == 2:
                return 'True'
            else:
                return 'False'
        else:
            return

# types: players, board_change, next_turn, winner
# // "{"type":"players","value":"GET PLAYERS"}"
# // "{"type":"board_change","value":{"mark":"X","id":id}}"
# // "{"type":"next_turn","value":next_user()}"
# // "{"type":"winner","value":{"username":game_winner,"game_id":game_id}}"
@app.route('/game-websocket', websocket=True)
def game_websocket():
    ws = simple_websocket.Server(request.environ)
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        ws.close()
        return
    user = request_info['username']
    game_websockets[user] = ws
    userinfo = users_collection.find_one({'username': user})
    if not ('game_id' in userinfo.keys()) or not userinfo['game_id']:
        ws.close()
        return
    game_id = userinfo['game_id']
    players = game_collection.find_one({'game_id': game_id})['members']
    try:
        while True:
            data = ws.receive()
            # print(data)
            message_recv = loads(data)
            type = message_recv["type"]
            send_data = {}
            init = False
            # print(game_websockets)
            if type == "players":
                init = True
            elif type == "board_change":
                send_data = message_recv
            elif type == "next_turn":
                send_data = message_recv
            elif type == "winner":
                send_data = message_recv
                winner = (message_recv["value"])["username"]
                if(winner == user):
                    high_score = int((users_collection.find_one({"username": winner}, {"_id": 0}))["best_score"])
                    users_collection.update_one({'username': winner}, {"$set": {'best_score': high_score+1}})
            for player in players:
                if player != user and (player in game_websockets.keys()) and game_websockets[player]:
                    if init:
                        game_websockets[players[0]].send(dumps({"type":"players","value":{"members":players,"game_id":game_id,"player":players[0]}}))
                        game_websockets[players[1]].send(dumps({"type":"players","value":{"members":players,"game_id":game_id,"player":players[1]}}))
                        init = False
                    else:
                        game_websockets[players[0]].send(dumps(send_data))
                        game_websockets[players[1]].send(dumps(send_data))
    except simple_websocket.ConnectionClosed:
        print('here')
        users_collection.update_one({'username': user}, {"$set": {'game_id': None}})
        game_websockets[user] = None
        game_members = game_collection.find_one({'game_id': game_id})['members']
        if len(game_members) == 1:
            game_collection.delete_one({'game_id': game_id})
            print('deleted')
        else:
            for player in players:
                if player != user and (player in user_websockets.keys()) and user_websockets[player]:
                    user_websockets[player].send('disconnect')
            players.remove(user)
            game_collection.update_one({'game_id': game_id}, {"$set": {'members': players}})
    return ''


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)
