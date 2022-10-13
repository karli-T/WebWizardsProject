# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask
# pymongo database 
from pymongo import MongoClient
# json library to handle json objects
from bson.json_util import loads, dumps

# Mongo Setup
mongo_client = MongoClient("mongo")
db = mongo_client["WebWizards"]

users_collection = db["users"]
users_id_collection = db["user_id"]

# Flask Setup
app = Flask(__name__)

@app.route("/hello", methods = ["GET"])
def hello():
    return "Hello!!"

@app.route("/", methods = ["GET"])
def test():
    return "TEST!!"

if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=8000)
