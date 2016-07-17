function connect(id) {
  var peer = new Peer(id, {host: 'paxos-video-webrtc.herokuapp.com', port: 80});
  peer.on('open', function(id) { console.log('My peer ID is: ' + id) });
  return peer;
}

function handleConnect(conn) {
  conn.on('data', function(data){
    console.log(data);
  });
}

function connectToPeer(peer, myId, id) {
  var conn = peer.connect(id);
  conn.on('open', function(){
    conn.send('hi ' + id + '. My id is ' + myId);
  });
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  }); 
}

var id = generateId();
var peer = connect(id);
peer.on('connection', handleConnect);
