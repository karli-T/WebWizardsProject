
const socket = new WebSocket('ws://' + window.location.host + '/game-websocket');

// save lobby id
var game_id = "";

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
// request player info from server once connection is established
socket.onopen = function(event) {
    console.log('Player Connected');
    get_players();
};

// received data sent from sockets
// types: players, board_change, next_turn, winner
// "{"type":"players","value":"GET PLAYERS"}"
// "{"type":"board_change","value":{"mark":"X","id":id}}"
// "{"type":"next_turn","value":next_user()}"
// "{"type":"winner","value":{"username":game_winner,"game_id":game_id}}"
// players updates the player variables and game_id for the game, receives lobby information
// board_change updates the HTML front-end for the game
// next_turn updates the HTML displaying who's turn it is
// winner updates the HTML displaying the winner
socket.onmessage = function (ws_message)  {
    const recv = JSON.parse(ws_message.data);
    const type = recv.type

    var init = false

    console.log(recv)

    switch(type) {
        case 'players':
            // console.log(typeof recv.value)
            var members = (recv.value)["members"]
            var sender = (recv.value)["player"]

            game_id = ((recv.value)["game_id"])

            player1 = {"username":members[0],"mark":"X"};
            player2 = {"username":members[1],"mark":"O"};

            if(sender == members[0]){
                user = {"username":members[0],"mark":"X"};
            }else if(sender == members[1]){
                user = {"username":members[1],"mark":"O"};
            }
            curr_users_turn = {"username":members[0],"mark":"X"};
            init_game({"username":members[0],"mark":"X"});
            init = true
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
            winner(recv.value["username"]);
            break;
        default:
            console.log("received an invalid WS messageType");
    }
};
// initialized important HTML parts and variables of the game
function init_game(curr){
    // console.log(JSON.stringify(player1))
    // console.log(JSON.stringify(player2))
    // console.log(curr["username"])
    console.log(document.getElementById("curr_player").innerHTML)
    // console.log(JSON.stringify(user))
    var newuser = document.getElementById("curr_player").innerHTML.replace("username",curr["username"]);
    document.getElementById("curr_player").innerHTML = newuser;
    document.getElementById("curr_player_div").style.display = "block"
    // console.log(newuser)
    // name the room with curr players username (should be player1)
    var owner = document.getElementById("owner_header").innerHTML.replace("owner",curr["username"]);
    // console.log(owner)
    document.getElementById("owner_header").innerHTML = owner;

        // console.log(curr_users_turn)
}
function click_cell(id){
    if(user_turn(id)){
        var cell = document.getElementById(id).innerHTML;
        if(cell == ""){
            socket.send(JSON.stringify({"type":"board_change","value":{"mark":user["mark"],"id":id}}))
        }
    }
}

// window.onload=function(){
//     // initialize game once both players are in game
//     init_game();
// }

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
    var is_winner = false;

    var cell = document.getElementById(id);
    cell.className = "chosen";
    cell.innerHTML = mark;

    is_winner = game_event();
        if(!is_winner){
            if(draw()){
                tie();
            }else{
                socket.send(JSON.stringify({"type":"next_turn","value":next_user()}))
            }
        }else{
            socket.send(JSON.stringify({"type":"winner","value":{"username":game_winner,"game_id":game_id}}))
        }
};

// function to change current users turn
function change_user(player){
    curr_users_turn = player;
    var newuser = document.getElementById("curr_player")

    if(player["username"] == player1["username"]){
        newuser = newuser.innerHTML.replace(player2["username"],player1["username"]);
    }else{
        newuser = newuser.innerHTML.replace(player1["username"],player2["username"]);
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

// function to check draw
// if all cells have a mark and game event didn't catch a winner, it is a draw
function draw(){
    var cell1 = document.getElementById("1").innerHTML;
    var cell2 = document.getElementById("2").innerHTML;
    var cell3 = document.getElementById("3").innerHTML;
    var cell4 = document.getElementById("4").innerHTML;
    var cell5 = document.getElementById("5").innerHTML;
    var cell6 = document.getElementById("6").innerHTML;
    var cell7 = document.getElementById("7").innerHTML;
    var cell8 = document.getElementById("8").innerHTML;
    var cell9 = document.getElementById("9").innerHTML;
    
    if(cell1 != "" && cell2 != "" && cell3 != "" && cell4 != "" && cell5 != "" && cell6 != "" && cell7 != "" && cell8 != "" && cell9 != ""){
        return true
    }
    return false
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
    var replace = document.getElementById("winner_label").innerHTML.replace("username!",username+"!");
    document.getElementById("winner_label").innerHTML = replace;
    curr_users_turn = {};
    document.getElementById("curr_player_div").style.display = "none";
    document.getElementById("winner_div").style.display = "block";
};
function tie(){
    curr_users_turn = {};
    document.getElementById("curr_player_div").style.display = "none";
    document.getElementById("draw_div").style.display = "block";
}
function leave_lobby(){
    socket.close()
    setTimeout(() => {window.location.replace('hub');}, 500)
};