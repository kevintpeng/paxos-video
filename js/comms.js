function connect(id) {
  return new Peer(id, {
    host: 'paxos-video-webrtc.herokuapp.com',
    port: 443,
    secure: true,
    room: window.room
  });
}

function connectionToPeer(id) {
  if (window.conn[id] === 'undefined') {
    window.conn[id] = window.peer.connect(id);
    window.conn[id].label = window.id;
  }
  return window.conn[id];
}

function handlePeerConnection(peer) {
  window.peers.push(peer);
  console.log('Connected ' + peer + '. Peers are now ' + window.peers);
}

function handlePeerDisconnection(peer) {
  if (window.peers === 'undefined') {
    return
  }

  var index = window.peers.indexOf(peer);
  if (index > -1) {
    window.peers.splice(index, 1);
    console.log('Disconnected ' + peer + '. Peers are now ' + window.peers);
  } else {
    console.log('Could not find ' + peer + ' to disconnect. Peers are now ' + window.peers);
  }
}

function sendDataToPeers(data, peers) {
  for (var peerIdx in peers) {
    var id = peers[peerIdx];
    if(id == window.id) {
      continue
    }

    console.log('Sending data to ' + id);
    connectionToPeer(id).on('open', function(){
      this.send(data);
      document.getElementById('peerJSInput').value = '';
    });
  }
}

function receiveDataFromPeer(conn) {
  conn.on('data', function(data){
    console.log('Receiving data from ' + conn.label);
    appendText(conn.label, data);
  });
}

// Helpers

function sendDataFromDOM() {
  var data = document.getElementById('peerJSInput').value;
  sendDataToPeers(data, window.peers);
  appendText(window.id, data);
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

window.room = prompt('What is the room?')
window.id = generateId();
document.getElementById('room').innerHTML = window.room + "&nbsp; <small>" + window.id + "</small>";

window.peer = connect(window.id);
window.peer.listRoomMemberPeers(window.room, function(peers) {
  window.peers = peers;
});
window.peer.on('connection', receiveDataFromPeer);
window.peer.on('join', handlePeerConnection);
window.peer.on('leave', handlePeerDisconnection);
