
const socket = new WebSocket('ws://' + window.location.host + '/websocket');

// function to validate a users click (if it is not their turn, their choice should not be sent)


// function to insert X or O into table cell depending on user
function insert_letter(id){
    var cell = document.getElementById(id);
    cell.className = "chosen";
    cell.innerHTML = "X"
}

document.getElementById("1").addEventListener("click",function(){
    insert_letter("1");
 })
document.getElementById("2").addEventListener("click",function(){
    insert_letter("2");
})
document.getElementById("3").addEventListener("click",function(){
    insert_letter("3");
})
document.getElementById("4").addEventListener("click",function(){
    insert_letter("4");
 })
document.getElementById("5").addEventListener("click",function(){
    insert_letter("5");
})
document.getElementById("6").addEventListener("click",function(){
    insert_letter("6");
})
document.getElementById("7").addEventListener("click",function(){
    insert_letter("7");
 })
document.getElementById("8").addEventListener("click",function(){
    insert_letter("8");
})
document.getElementById("9").addEventListener("click",function(){
    insert_letter("9");
})



//from HW code
document.addEventListener("click", function (event) {
    if (event.code === "Enter") {
        sendMessage();
    }
});

function sendMessage(){
    const gameInput = document.getElementById('game-input');
    const gameText = gameInput.value;
    gameInput.value = "";
    if (gameText !== ""){
        socket.send(gameText)
    }
}

socket.onmessage = function (message)  {
    inputs = document.getElementById('game-inputs');
    inputs.innerHTML += "<b>" + message.data + "<br/>";
}
