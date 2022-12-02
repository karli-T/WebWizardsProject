const socket = new WebSocket('ws://' + window.location.host + '/lobby-websocket');

socket.onmessage = function (message) {
    if (message.data === 'send to new game') {
        console.log(message.data)
         window.location.replace('game');
    }
    else {
        document.getElementById("member-2").innerText = message.data
    }
}

function leaveLobby() {
    socket.close()
    setTimeout(() => {window.location.replace('hub');}, 500)
}

function startGame() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function(){
        if (this.readyState === 4 && this.status === 200){
            if (this.responseText === 'True') {
                creatGame()
            }
        }
    };
    request.open("GET", "/validate-new-game");
    request.send()
}

function creatGame() {
    const creatGameRequest = new XMLHttpRequest();
    creatGameRequest.onreadystatechange = function(){
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText === 'game created')
            socket.send('start_game')
            setTimeout(() => {window.location.replace('game')}, 500)
        }
    }
    creatGameRequest.open("GET", "/create-game");
    creatGameRequest.send()
}