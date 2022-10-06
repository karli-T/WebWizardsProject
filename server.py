# import Flask : https://flask.palletsprojects.com/en/2.2.x/quickstart/
from flask import Flask
# pymongo database 
from pymongo import MongoClient
# json library to handle json objects
from bson.json_util import loads, dumps

mongo_client = MongoClient("mongo")
db = mongo_client["WebWizards"]

users_collection = db["users"]
users_id_collection = db["user_id"]
