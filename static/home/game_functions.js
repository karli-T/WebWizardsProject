
const socket = new WebSocket('ws://' + window.location.host + '/game-websocket');

// save lobby id
var lobby_id = 0;

// save both players info in a dictionary {"username":"","mark":""}
// player1 should always be the lobby creator or first member in lobby array
var player1 = {};
var player2 = {};

// holds info of curent players turn
// either player1 or player2
var curr_users_turn = {};

// holds user's info
// either player1 or player2
var user = {};

// holds winner of game
var game_winner = ""

// sends JSON Object to request player info from server only if both player variables are not updated
function get_players(){
    if(JSON.stringify(player1) == '{}' && JSON.stringify(player2) == '{}'){
        socket.send(JSON.stringify({"type":"players","value":"GET PLAYERS"}))
    }
}
// JSON Object to request user info from server only if user variable is not updated
// who is the client?
function get_user(){
    if(JSON.stringify(user) != '{}'){
        socket.send(JSON.stringify({"type":"client","value":"GET CLIENT"}))
    }
}
// received data sent from sockets
// types: players, client, board_change, next_turn, winner
// players updates the player variables and lobby_id for the game, receives lobby information
// client updates the user variable for the game
// board_change updates the HTML front-end for the game
// next_turn updates the HTML displaying who's turn it is
// winner updates the HTML displaying the winner
socket.onmessage = function (ws_message)  {
    const recv = JSON.parse(ws_message.data);
    const type = recv.type
    
    switch(type) {
        case 'players':
            var members = (recv.value)["members"]
            lobby_id = parseInt((recv.value)["lobby_id"])
            player1 = {"username":members[0],"mark":"X"};
            player2 = {"username":members[1],"mark":"O"};
            break;
        case 'client':
            if(recv.value == player1["username"]){
                user = player1;
            }else if(recv.value == player2["username"]){
                user = player2;
            }
            break;
        case 'board_change':
            var mark = (recv.value)["mark"];
            var id = (recv.value)["id"];
            insert_letter(id,mark);
            break;
        case 'next_turn':
            if(recv.value == "player1"){
                change_user(player1);
            }else if(recv.value == "player2"){
                change_user(player2);
            }
            break;
        case 'winner':
            winner(recv.value);
            break;
        default:
            console.log("received an invalid WS messageType");
    }
    
};
// initialized important HTML parts and variables of the game
function init_game(){
    // if both players are present and no one has started
    if(JSON.stringify(player1) != '{}' && JSON.stringify(player2) != '{}' && JSON.stringify(curr_users_turn) == '{}' && JSON.stringify(user) != '{}'){
        curr_users_turn = player1;
        var newuser = document.getElementById("curr_player").innerHTML.replace("{{username}}",player1["username"]);
        document.getElementById("curr_player").innerHTML = newuser;
        document.getElementById("curr_player_div").style.display = "block"

        // name the room with player 1's username
        var owner = document.getElementById("owner_header").innerHTML.replace("{{username}}",player1["username"]);
        document.getElementById("owner_header").innerHTML = owner;

        // console.log(curr_users_turn)
    }
}
// handles even listeners and data sent to sockets
window.onload=function(){
    var is_winner = false;

    // request player info from server
    get_players();
    // request user(client) info from server
    get_user();

    // initialize game once both players are in lobby
    init_game();

    var user_mark = user["mark"];
    document.getElementById("1").addEventListener("click",function(event){
        if(user_turn("1")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"1"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("2").addEventListener("click",function(event){
        if(user_turn("2")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"2"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("3").addEventListener("click",function(event){
        if(user_turn("3")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"3"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("4").addEventListener("click",function(event){
        if(user_turn("4")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"4"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("5").addEventListener("click",function(event){
        if(user_turn("5")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"5"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("6").addEventListener("click",function(event){
        if(user_turn("6")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"6"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("7").addEventListener("click",function(event){
        if(user_turn("7")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"7"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("8").addEventListener("click",function(event){
        if(user_turn("8")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"8"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    document.getElementById("9").addEventListener("click",function(event){
        if(user_turn("9")){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user_mark,"id":"9"}}))
            is_winner = game_event();
            if(!is_winner){
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }else{
                socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"lobby_id":lobby_id}}))
            }
        }
    });
    
};

// function to validate a users click (if it is not their turn, their choice should not be sent)
function user_turn(){
    if(JSON.stringify(player1) != '{}' && JSON.stringify(player2) != '{}' && JSON.stringify(curr_users_turn) != '{}' && JSON.stringify(user) != '{}'){
        if(curr_users_turn["username"] == user["username"]){
            return true;
        };
    }
    return false;
};
// function to insert X or O into table cell depending on user
function insert_letter(id,mark){
    var cell = document.getElementById(id);
    cell.className = "chosen";
    cell.innerHTML = mark;
};

// function to change current users turn
function change_user(player){
    curr_users_turn = player;
    var newuser = document.getElementById("curr_player")

    if(player["username"] == player1["username"]){
        newuser.innerHTML.replace(player2["username"],player1["username"]);
    }else{
        newuser.innerHTML.replace(player1["username"],player2["username"]);
    }

    document.getElementById("curr_player").innerHTML = newuser;
    document.getElementById("curr_player_div").style.display = "block"
};
// quick function to check who takes next turn
function next_user(){
    if(curr_users_turn["username"] == player1["username"]){
        return "player2"
    }else if(curr_users_turn["username"] == player2["username"]){
        return "player1"
    }
}
// function for game logic
function game_event(){
    var cell1 = document.getElementById("1").innerHTML;
    var cell2 = document.getElementById("2").innerHTML;
    var cell3 = document.getElementById("3").innerHTML;
    var cell4 = document.getElementById("4").innerHTML;
    var cell5 = document.getElementById("5").innerHTML;
    var cell6 = document.getElementById("6").innerHTML;
    var cell7 = document.getElementById("7").innerHTML;
    var cell8 = document.getElementById("8").innerHTML;
    var cell9 = document.getElementById("9").innerHTML;

    var mark = "";
    var win = false;
    // diagonal check
    if(cell1 == cell5 && cell5 == cell9 && cell1 != ""){
        mark = cell1;
        win = true;
    };
    if(cell3 == cell5 && cell5 == cell7 && cell3 != ""){
        mark = cell3;
        win = true;
    };

    // vertical check
    if(cell1 == cell4 && cell4 == cell7 && cell1 != ""){
        mark = cell1;
        win = true;
    };
    if(cell2 == cell5 && cell5 == cell8 && cell2 != ""){
        mark = cell2;
        win = true;
    };
    if(cell3 == cell6 && cell6 == cell9 && cell3 != ""){
        mark = cell3;
        win = true;
    };

    // horizontal check
    if(cell1 == cell2 && cell2 == cell3 && cell1 != ""){
        mark = cell1;
        win = true;
    };
    if(cell4 == cell5 && cell5 == cell6 && cell4 != ""){
        mark = cell4;
        win = true;
    };
    if(cell7 == cell8 && cell8 == cell9 && cell7 != ""){
        mark = cell7;
        win = true;
    };

    if(win){
        if(player1["mark"] == mark){
            game_winner = player1["username"];
        }else{
            game_winner = player2["username"];
        }
    }
    return win;
};
// function to replace winner label in game.html
function winner(username){
    var replace = document.getElementById("winner_label").innerHTML.replace("{{username}}",username);
    document.getElementById("winner_label").innerHTML = replace;
    curr_users_turn = {};
    document.getElementById("curr_player_div").style.display = "none";
    document.getElementById("winner_div").style.display = "block";
};

function leave_lobby(){
    window.location.replace('hub');
};