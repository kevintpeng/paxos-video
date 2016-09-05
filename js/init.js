function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

/*eslint-disable no-unused-vars */
function sendDataFromDOM() {
  var state = document.getElementById('peerJSInput').value;
  paxos.state = state;
  paxos.sendProposal();
}

function appendText(type, msg) {
  var node = document.createElement('p');
  node.innerHTML = '<b>' + type + ':</b> ' + msg;
  document.getElementById('output').appendChild(node);
}
/*eslint-enable no-unused-vars */

var room = 'room'; // prompt('What is the room?')
window.id = generateId();
document.getElementById('room').innerHTML = room + '&nbsp; <small>' + window.id + '</small>';

var comms = new Comms({
  id: window.id,
  room: room
});
comms.connect();

var paxos = new Paxos({
  id: window.id,
  comms: comms
});

window.comms = comms;
window.paxos = paxos;
