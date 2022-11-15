# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask, request, render_template, flash, redirect, url_for
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

# users attributes: {"user_id":"","email":"","username":"","password":"","active":"","lobby":"","best_score":""}
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


@app.route("/hello", methods=["GET"])
def hello():
    return "Hello!!"


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

# Receive GET request to user's hub
# sends of user dictionary with profile info
@app.route("/hub/<user>", methods=["GET"])
def hub(user):
    return render_template("hub.html",user=loads(user))


@app.route("/game", methods=["GET"])
def game():
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
    # request password input with name = reg_password in HTML form
    password = request.form.get("reg_password")

    # calls function to check if email and username are already used
    unique = database.check_unique(email, username, users_collection)


    if (unique == "Unique"):
        # add user to database
        database.add_user(email, username, password, users_collection)
        info = {"name":username,"score":"0"}
        # redirect to hub with profile info
        return redirect(url_for('hub', user=dumps(info)))
    elif (unique == "Username"):
        flash('Username already taken.')
        return render_template("index.html")
    elif (unique == "Email"):
        flash('Email already being used.')
        return render_template("index.html")
    return render_template("index.html")


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

    if (user):
        # get best score of user to pass to redirect
        get_score = users_collection.find_one({"username":username},{"_id":0})
        info= {"name":username,"score":get_score["best_score"]}
        return redirect(url_for('hub', user=dumps(info)))
    else:
        flash('Invalid Email or Password!')
        return render_template("index.html")


@socket.route(path='/websocket')
def echo(sock):
    while True:
        data = sock.receive()
        sock.send(data)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)
