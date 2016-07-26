"use strict";

class PeerMock {
  constructor(id, options) {
    this.id = id;
    this.options = options;
    this.peers = [];

    this.ons = {};
    this.sendToAlls = {}
  }

  listRoomMemberPeers(room, cb) {
    cb(this.peers);
  }

  connect(id, options) {
    return { id: id, options: options };
  }

  sendToAll(type, data) {
    this.sendToAlls[type] = data;
  }

  on(event, cb) {
    this.ons[event] = cb;
  }
}

module.exports = PeerMock;
