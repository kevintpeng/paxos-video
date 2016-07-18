function connect(id) {
  return new Peer(id, {
    host: 'paxos-video-webrtc.herokuapp.com',
    port: 443,
    secure: true,
    room: window.room
  });
}

function handleConnect(conn) {
  conn.on('data', function(data){
    console.log('Receiving data from ' + conn.label);
    appendText(conn.label, data);
  });
}

function connectToPeers(data, peers) {
  for (var peerIdx in peers) {
    var id = peers[peerIdx];
    if(id == window.id) {
      continue
    }

    console.log('Sending data to ' + id);
    window.conn = window.peer.connect(id);
    window.conn.label = window.id;

    window.conn.on('open', function(){
      window.conn.send(data);
      appendText(window.id, data);
      document.getElementById('peerJSInput').value = '';
    }); 
  }
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

function sendData() {
  var data = document.getElementById('peerJSInput').value;
  window.peer.listRoomMemberPeers(window.room, function(peers){
    connectToPeers(data, peers);
  });
}

window.id = generateId();
window.room = prompt('What is the room?')
document.getElementById('room').innerHTML = window.room;
window.peer = connect(window.id);
window.peer.on('connection', handleConnect);
