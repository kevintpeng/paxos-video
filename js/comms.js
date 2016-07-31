'use strict';

class Comms {
  constructor(options) {
    this.id = options.id;
    this.room = options.room;

    this.peers = [];
    this.peer = null;
    this.conns = {};
  }

  connect() {
    this.peer = new Peer(this.id, {
      host: 'paxos-video-webrtc.herokuapp.com',
      port: 443,
      secure: true,
      room: this.room
    });

    // Populate this.peers
    var comms = this;
    this.peer.listRoomMemberPeers(this.room, function(peers) {
      comms.peers = peers;
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

  sendDataToPeer(id, type, data) {
    var conn = this.connectionToPeer(id);
    var comms = this;
    conn.on('open', function(){
      comms.peer.sendToAll(type, data);
      window.appendText(id, JSON.stringify(data));
      document.getElementById('peerJSInput').value = '';
    });
  }

  // Handlers

  handlePeerConnection() {
    var comms = this;
    return function(peer) {
      comms.peers.push(peer);
      console.info('Connected ' + peer + '. Peers are now ' + comms.peers);
    };
  }

  handlePeerDisconnection() {
    var comms = this;
    return function(peer) {
      if (typeof comms.peers === 'undefined') {
        return;
      }

      var index = comms.peers.indexOf(peer);
      if (index > -1) {
        comms.peers.splice(index, 1);
        console.info('Disconnected ' + peer + '. Peers are now ' + comms.peers);
      } else {
        console.info('Could not find ' + peer + ' to disconnect. Peers are now ' + comms.peers);
      }
    };
  }
}

module.exports = Comms;
