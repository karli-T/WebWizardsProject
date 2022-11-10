
const socket = new WebSocket('ws://' + window.location.host + '/websocket');

//from HW code
document.addEventListener("keypress", function (event) {
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

