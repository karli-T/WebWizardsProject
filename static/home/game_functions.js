
const socket = new WebSocket('ws://' + window.location.host + '/websocket');

// save both players info in a dictionary {"username":"","mark":""}
// player1 should always be the lobby creator
var player1 = {};
var player2 = {};

// holds info of curent players turn
var curr_users_turn = {};

// holds user's info
var user = {};

// function to validate a users click (if it is not their turn, their choice should not be sent)
function user_turn(id){
    if(curr_users_turn["username"] == user["username"]){
        insert_letter(id);
        return true;
    };
    return false;
};

// function to insert X or O into table cell depending on user
function insert_letter(id){
    var cell = document.getElementById(id);
    cell.className = "chosen";
    cell.innerHTML = user["mark"];
};

// function to change current users turn
function change_user(){
    if(curr_users_turn["username"] == player1["username"]){
        curr_users_turn = player2;
        var newuser = document.getElementById("curr_player").innerHTML.replace(player1["username"],player2["username"]);
        document.getElementById("curr_player").innerHTML = newuser;
        document.getElementById("curr_player_div").style.display = "block"
        console.log(newuser)
    }else{
        curr_users_turn = player1;
        var newuser = document.getElementById("curr_player").innerHTML.replace(player2["username"],player1["username"]);
        document.getElementById("curr_player").innerHTML = newuser;
        document.getElementById("curr_player_div").style.display = "block"
    }
};

function init_game(){
    // if both players are present and no one has started
    if(JSON.stringify(player1) != '{}' && JSON.stringify(player2) != '{}' && JSON.stringify(curr_users_turn) == '{}'){
        curr_users_turn = player1;
        var newuser = document.getElementById("curr_player").innerHTML.replace("{{username}}",player1["username"]);
        document.getElementById("curr_player").innerHTML = newuser;
        document.getElementById("curr_player_div").style.display = "block"
        console.log(curr_users_turn)
    }
}

window.onload=function(){
    var winner = false;
    // initialize game once both players are in lobby
    init_game();
    // name the room with player 1's username
    var owner = document.getElementById("owner_header").innerHTML.replace("{{username}}",player1["username"]);
    document.getElementById("owner_header").innerHTML = owner;

    document.getElementById("1").addEventListener("click",function(event){
        if(user_turn("1")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("2").addEventListener("click",function(event){
        if(user_turn("2")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("3").addEventListener("click",function(event){
        if(user_turn("3")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("4").addEventListener("click",function(event){
        if(user_turn("4")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("5").addEventListener("click",function(event){
        if(user_turn("5")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("6").addEventListener("click",function(event){
        if(user_turn("6")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("7").addEventListener("click",function(event){
        if(user_turn("7")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("8").addEventListener("click",function(event){
        if(user_turn("8")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
    document.getElementById("9").addEventListener("click",function(event){
        if(user_turn("9")){
            winner = game_event();
            if(!winner){change_user();}
        }
    });
};


//from HW code
document.addEventListener("keypress", function (event) {
    if (event.code === "Enter") {
        sendMessage();
    };
});

function sendMessage(){
    const gameInput = document.getElementById('game-input');
    const gameText = gameInput.value;
    gameInput.value = "";
    if (gameText !== ""){
        socket.send(gameText)
    };
};

socket.onmessage = function (message)  {
    inputs = document.getElementById('game-inputs');
    inputs.innerHTML += "<b>" + message.data + "<br/>";
};


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

    // diagonal check
    if(cell1 == cell5 && cell5 == cell9 && cell1 != ""){
        return winner(cell1);
    };
    if(cell3 == cell5 && cell5 == cell7 && cell3 != ""){
        return winner(cell3);
    };

    // vertical check
    if(cell1 == cell4 && cell4 == cell7 && cell1 != ""){
        return winner(cell1);
    };
    if(cell2 == cell5 && cell5 == cell8 && cell2 != ""){
        return winner(cell2);
    };
    if(cell3 == cell6 && cell6 == cell9 && cell3 != ""){
        return winner(cell3);
    };

    // horizontal check
    if(cell1 == cell2 && cell2 == cell3 && cell1 != ""){
        return winner(cell1);
    };
    if(cell4 == cell5 && cell5 == cell6 && cell4 != ""){
        return winner(cell4);
    };
    if(cell7 == cell8 && cell8 == cell9 && cell7 != ""){
        return winner(cell7);
    };

    return false;
};
// function to replace winner label in game.html
function winner(cell){
    if(player1["mark"] == cell){
        var replace = document.getElementById("winner_label").innerHTML.replace("{{username}}",player1["username"]);
        document.getElementById("winner_label").innerHTML = replace;
        curr_users_turn = {};
        document.getElementById("curr_player_div").style.display = "none"
        document.getElementById("winner_div").style.display = "block"
    }else{
        var replace = document.getElementById("winner_label").innerHTML.replace("{{username}}",player2["username"]);
        document.getElementById("winner_label").innerHTML = replace;
        curr_users_turn = {};
        document.getElementById("curr_player_div").style.display = "none"
        document.getElementById("winner_div").style.display = "block"
    };

    return true;
};

function leave_lobby(){

};