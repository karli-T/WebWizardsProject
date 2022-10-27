# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask, request, render_template, flash, redirect
# pymongo database 
from pymongo import MongoClient
# json library to handle json objects
from bson.json_util import loads, dumps
# import database.py
import database
# import sys

# Mongo Setup
mongo_client = MongoClient("mongo")
db = mongo_client["WebWizards"]

# users attributes: {"user_id":"","email":"","username":"","password":"","active":"","lobby":"","best_score":""}
# more will be added once more user attributes decided for game
users_collection = db["users"]
users_id_collection = db["user_id"]

# code from Jesse's Lecture on HTML Injection
def escape_html(comment):
    stripped = comment.replace('&',"&amp;").replace('<',"&lt;").replace('>',"&gt;")
    return stripped

# Flask Setup
app = Flask(__name__)
app.config['SECRET_KEY'] = '3333333333'

@app.route("/hello", methods = ["GET"])
def hello():
    return "Hello!!"

@app.route("/", methods = ["GET"])
def index():
    # print(list(users_collection.find({},{'_id':0})))
    # sys.stdout.flush()
    # sys.stderr.flush()
    return render_template("index.html")

@app.route("/hub", methods = ["GET"])
def hub():
    return render_template("hub.html")


# Receive POST request for registering
@app.route('/register', methods =["POST"])
def register_user():
    # request email input with name = reg_email in HTML form
    email = request.form.get("reg_email")
    # request username input with name = reg_username in HTML form
    username = request.form.get("reg_username")
    # request password input with name = reg_password in HTML form
    password = request.form.get("reg_password")

    unique = database.check_unique(email,escape_html(username),users_collection)
    if(unique == "Unique"):
        database.add_user(email,escape_html(username),password,users_collection)
        return redirect("/hub")
    elif(unique == "Username"):
        flash('Username already taken.')
        return render_template("index.html")
    elif(unique == "Email"):
        flash('Email already being used.')
        return render_template("index.html")
    
# Receive POST request for login
@app.route('/login', methods =["POST"])
def login():
    # request username input with name = log_username in HTML form
    username = request.form.get("log_username")
    # request password input with name = log_password in HTML form
    password = request.form.get("log_password")

    user = database.find_user(username,password,users_collection)

    if(user):
        return redirect("/hub")
    else:
        flash('Invalid Email or Password!')
        return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)