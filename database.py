import hashlib

# function to track userID's
def current_id(id_database):
    id_object = id_database.find_one({})
    if id_object: 
        next_id = int(id_object['curr_id']) + 1
        id_database.update_one({},{'$set' : {'curr_id': next_id}})
        return next_id
    else:
        id_database.insert_one({'curr_id': 1})
        return 1

# encrypy passwords
def encrypt_password(password):
    # encrypt password and save as readable hexadecimals
    password = hashlib.sha256(password.encode()).hexdigest()
    return password

# function to add user to database
# if active = 0, user is deleted (still want to keep their data)
def add_user(email,username,password,user_db):
    new_id = current_id(user_db)
    encrypted = encrypt_password(password)
    input = {"user_id":new_id,"email":email,"username":username,"password":encrypted,"active":1}
    user_db.insert_one(input)

# function to check if user exists
def find_user(username,password,user_db):
    encrypted = encrypt_password(password)
    user = user_db.find_one({'username':username,'password':encrypted,'active':'1'},{'_id':0})
    if(user):
        return True
    else:
        return False

# function to check if email and username is unique
def check_unique(email,username,user_db):
    username = user_db.find_one({'username':username},{'_id':0})
    email = user_db.find_one({'email':email},{'_id':0})

    if(username):
        return "Username"
    elif(email):
        return "Email"
    else:
        return "Unique"