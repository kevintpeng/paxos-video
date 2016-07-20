class Comms {

  constructor(options) {
    self = this;

    this.id = options.id;
    this.room = options.room;

    this.peers = [];
    this.peer = null;
    this.conns = {};

    this.connect();
  }

  connect() {
    this.peer = new Peer(this.id, {
      host: 'paxos-video-webrtc.herokuapp.com',
      port: 443,
      secure: true,
      room: this.room
    });


    // Populate this.peers
    this.peer.listRoomMemberPeers(this.room, function(peers) {
      self.peers = peers;
    });

    this.peer.on('connection', this.handleIncomingData);
    this.peer.on('join', this.handlePeerConnection);
    this.peer.on('leave', this.handlePeerDisconnection);
  }

  connectionToPeer(id) {
    if (!(id in this.conns)) {
      this.conns[id] = this.peer.connect(id);
      this.conns[id].label = this.id;
    }
    return this.conns[id];
  }

  sendDataToPeers(data) {
    for (var peerIdx in this.peers) {
      var id = this.peers[peerIdx];
      if(id == this.id) {
        continue
      }

      console.log('Sending data to ' + id);
      var conn = this.connectionToPeer(id)

      conn.on('open', function(){
        self.send(data);
        document.getElementById('peerJSInput').value = '';
      });
    }
  }

  // Handlers

  handleIncomingData(conn) {
    conn.on('data', function(data){
      console.log('Receiving data from ' + conn.label);
      self.appendText(conn.label, data);
    });
  }

  handlePeerConnection(peer){
    self.peers.push(peer);
    console.log('Connected ' + peer + '. Peers are now ' + self.peers);
  }

  handlePeerDisconnection(peer){
    if (self.peers === 'undefined') {
      return
    }

    var index = self.peers.indexOf(peer);
    if (index > -1) {
      self.peers.splice(index, 1);
      console.log('Disconnected ' + peer + '. Peers are now ' + self.peers);
    } else {
      console.log('Could not find ' + peer + ' to disconnect. Peers are now ' + self.peers);
    }
  }

  // Helpers

  appendText(id, text) {
    var node = document.createElement("p");
    node.innerHTML = '<b>' + id + ':</b> ' + text
    document.getElementById('output').appendChild(node);
  }
}
