function connect(id) {
  return new Peer(id, {
    host: 'paxos-video-webrtc.herokuapp.com',
    port: 443,
    secure: true,
    room: window.room
  });
}

function handlePeerConnection(conn) {
  conn.on('data', function(data){
    console.log('Receiving data from ' + conn.label);
    appendText(conn.label, data);
  });
}

function sendDataToPeers(data, peers) {
  for (var peerIdx in peers) {
    var id = peers[peerIdx];
    if(id == window.id) {
      continue
    }

    // Broker connections
    console.log('Sending data to ' + id);
    window.conn[id] = window.peer.connect(id);
    window.conn[id].label = window.id;

    // Send data
    window.conn[id].on('open', function(){
      this.send(data);
      document.getElementById('peerJSInput').value = '';
    });
  }
}

function sendData() {
  var data = document.getElementById('peerJSInput').value;
  window.peer.listRoomMemberPeers(window.room, function(peers){
    sendDataToPeers(data, peers);
    appendText(window.id, data);
  });
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }); 
}

function appendText(id, text) {
  var node = document.createElement("p");
  node.innerHTML = '<b>' + id + ':</b> ' + text
  document.getElementById('output').appendChild(node);
}

window.conn = {}

window.room = prompt('What is the room?')
document.getElementById('room').innerHTML = window.room;

window.id = generateId();
document.getElementById('id').innerHTML = window.id;

window.peer = connect(window.id);
window.peer.on('connection', handlePeerConnection);
