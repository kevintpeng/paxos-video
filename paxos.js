function connect(id) {
  var peer = new Peer(id, {
    host: 'paxos-video-webrtc.herokuapp.com',
    port: 443,
    secure: true,
    debug: 3
  });
  peer.on('open', function(id) { console.log('My peer ID is: ' + id) });
  return peer;
}

function handleConnect(conn) {
  conn.on('data', function(data){
    appendText(conn.label, data);
  });
}

function connectToPeer(data) {
  var id = document.getElementById('peerID').value;

  window.conn = window.peer.connect(id);
  window.conn.label = window.id;

  window.conn.on('open', function(){
    window.conn.send(data);
    appendText(window.id, data);
    document.getElementById('peerJSInput').value = '';
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

function sendData() {
  var data = document.getElementById('peerJSInput').value;
  connectToPeer(data);
}

window.id = generateId();
window.peer = connect(window.id);
window.peer.on('connection', handleConnect);
