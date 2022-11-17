import secrets
import bcrypt


# function to track userID's
def current_id(id_database):
    id_object = id_database.find_one({})
    if id_object:
        next_id = int(id_object['curr_id']) + 1
        id_database.update_one({}, {'$set': {'curr_id': next_id}})
        return next_id
    else:
        id_database.insert_one({'curr_id': 1})
        return 1


# encrypy passwords
def encrypt(data):
    # encrypt password or auth token
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(data.encode(), salt)
    return hashed_pw


# function to add user to database
# if active = 0, user is deleted (still want to keep their data)
def add_user(email, username, password, user_db):
    new_id = current_id(user_db)
    encrypted = encrypt(password)
    auth_token = secrets.token_urlsafe(16)
    hashed_auth_token = encrypt(auth_token)
    user_data = {"user_id": new_id, "email": email, "username": username, "password": encrypted,
                 "hashed_auth_token": hashed_auth_token, "active": 1, "best_score": 0}
    user_db.insert_one(user_data)
    return auth_token


# function to check if user exists
def find_user(username, password, user_db):
    valid_login = True
    user = user_db.find_one({"username": username, "active": 1}, {"_id": 0})
    if not user:
        valid_login = False
    else:
        hashed_pw = user["password"]
        valid_login = bcrypt.checkpw(password.encode(), hashed_pw)
    if valid_login:
        return True
    else:
        return False


# function to check if email and username is unique
def check_unique(email, username, user_db):
    username = user_db.find_one({'username': username}, {'_id': 0})
    email = user_db.find_one({'email': email}, {'_id': 0})

    if username:
        return "Username"
    elif email:
        return "Email"
    else:
        return "Unique"


# check if request contains valid auth token
def is_valid_user(request, user_db):
    ret = {'valid': False, 'username': None, 'score': None}
    if 'auth_token' in request.cookies.keys():
        auth_token = request.cookies.get('auth_token')
        all_users = user_db.find({})
        for user in all_users:
            if 'hashed_auth_token' in user.keys():
                hashed_auth_token = user['hashed_auth_token']
                if bcrypt.checkpw(auth_token.encode(), hashed_auth_token):
                    ret['valid'] = True
                    ret['username'] = user['username']
                    ret['score'] = user['best_score']
                    break
    return ret


# generate new auth token for user
def gen_new_auth_token(username, user_db):
    auth_token = secrets.token_urlsafe(16)
    hashed_auth_token = encrypt(auth_token)
    user_db.update_one({"username": username}, {"$set": {"hashed_auth_token": hashed_auth_token}})
    return auth_token


# check if passwords aee strong and match
def validate_pw(password, re_enter):
    flash_display = None
    if password != re_enter:
        flash_display = "Passwords Don't Match"
        return flash_display
    elif len(password) < 5:
        flash_display = "Password Too Week"
        return flash_display
    return flash_display


# get usernames of top 10 players
def get_leaderboard(user_db):
    leaderboard_all = []
    users = user_db.find({})
    for user in users:
        if 'best_score' in user.keys():
            leaderboard_all.append(user)
    leaderboard_all = sorted(leaderboard_all, key=lambda usr: usr['best_score'], reverse=True)
    top_ten = list(map(lambda leader: leader['username'], leaderboard_all))
    if len(top_ten) > 10:
        return top_ten[:10]
   #elif len(top_ten) < 10:
