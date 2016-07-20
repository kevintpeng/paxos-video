function sendDataFromDOM() {
  var data = document.getElementById('peerJSInput').value;
  window.comms.sendDataToPeers(data);
  window.comms.appendText(this.id, data);
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

room = prompt('What is the room?')
id = generateId();

document.getElementById('room').innerHTML = room + "&nbsp; <small>" + id + "</small>";

var comms = new Comms({
  id: id,
  room: room
})
window.comms = comms;