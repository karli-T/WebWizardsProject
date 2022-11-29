# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask, request, render_template, flash, redirect, url_for, make_response
# pymongo database 
from pymongo import MongoClient
# json library to handle json objects
from bson.json_util import loads, dumps
# import database.py
import database
# import socketIO for websockets
from flask_sock import Sock

# Mongo Setup
mongo_client = MongoClient("mongo")
db = mongo_client["WebWizards"]

# users attributes: {"user_id":"","email":"","username":"","password":"","hashed_auth_token":"","active":"","lobby":"","best_score":""}
# more will be added once more user attributes decided for game
users_collection = db["users"]
users_id_collection = db["user_id"]


# code from Jesse's Lecture on HTML Injection
def escape_html(comment):
    stripped = comment.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;")
    return stripped


# Flask Setup
app = Flask(__name__)
app.config['SECRET_KEY'] = '3333333333'
socket = Sock(app)


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
        return render_template("hub.html", user=loads(dumps(info)))


@app.route("/game", methods=["GET"])
def game():
    request_info = database.is_valid_user(request, users_collection)
    if not request_info['valid']:
        return redirect('/')
    else:
        return render_template("game.html")


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
        resp.headers['Set-Cookie'] = 'auth_token=' + auth_token
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
        resp.headers['Set-Cookie'] = 'auth_token=' + auth_token
        return resp
    else:
        flash('Invalid Username or Password!')
        return redirect('/')
# Receive GET request for logout       
@app.route('logout',methods=["GET"])
def logout():
    return redirect('/')

@socket.route(path='/websocket')
def echo(sock):
    while True:
        data = sock.receive()
        sock.send(data)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)
