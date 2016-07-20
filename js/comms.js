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

    this.peer.on('join', this.handlePeerConnection);
    this.peer.on('leave', this.handlePeerDisconnection);
  }

  connectionToPeer(id) {
    if (!(id in this.conns)) {
      var conn = this.peer.connect(id, { serialization: 'json', label: this.id });
      if (!conn) {
        console.error('conn was undefined');
      }
      this.conns[id] = conn;
    }
    return this.conns[id];
  }

  sendDataToPeer(peer, type, data) {
    if (this.peers.indexOf(peer) == -1 || peer == this.id) {
      return
    }

    data['type'] = type;
    var stringData = JSON.stringify(data);

    var conn = this.connectionToPeer(id)
    conn.on('open', function(){
      this.send(stringData);
      window.appendText(id, stringData);
      document.getElementById('peerJSInput').value = '';
    });
  }

  // Handlers

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
}
