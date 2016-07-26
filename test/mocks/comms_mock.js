'use strict';

let path     = require('path'),
  PeerMock = require(path.join(__dirname, 'peer_mock')); 

class CommsMock {
  constructor(options) {
    this.id = options.id;
    this.room = options.room;

    this.peers = [];
    this.peer = null;
    this.conns = {};
    this.sendDataToPeers = {};

    this.connect();
  }

  connect() { 
    this.peer = new PeerMock(this.id, {
      host: 'paxos-video-webrtc.herokuapp.com',
      port: 443,
      secure: true,
      room: this.room
    });
  }

  sendDataToPeer(id, type, data) { 
    this.sendDataToPeers[id] = { 'type': type, 'data': data };
  }

  // Handlers

  handlePeerConnection(peer){
    this.peers.push(peer);
    console.log('Connected ' + peer + '. Peers are now ' + this.peers);
  }

  handlePeerDisconnection(peer){
    if (this.peers === 'undefined') {
      return;
    }

    var index = this.peers.indexOf(peer);
    if (index > -1) {
      this.peers.splice(index, 1);
      console.log('Disconnected ' + peer + '. Peers are now ' + this.peers);
    } else {
      console.log('Could not find ' + peer + ' to disconnect. Peers are now ' + this.peers);
    }
  }
}

module.exports = CommsMock;
