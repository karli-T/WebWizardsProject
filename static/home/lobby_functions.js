const socket = new WebSocket('ws://' + window.location.host + '/lobby-websocket');

socket.onmessage = function (message) {
    document.getElementById("member-2").innerText = message.data
}

function leaveLobby() {
    window.location.replace('hub');
}