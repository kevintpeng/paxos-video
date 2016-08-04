'use strict';

class Comms {
  constructor(options) {
    this.id = options.id;
    this.room = options.room;

    this.rtc = null;
    this.handleReceiveData = function(evt){ };
    this.peers = [];
  }

  connect() {
    this.rtc = new SimpleWebRTC({ media: {} });
    this.rtc.on('readyToCall', this.init());
  }

  init() {
    var comms = this;
    return function() {
      comms.rtc.on('data', comms.handleReceiveData);
      comms.rtc.joinRoom(comms.room);
    };
  }

  setHandleReceivedData(fnc) {
    this.handleReceiveData = fnc;
    this.rtc.on('data', this.handleReceiveData);
  }

  sendDataToChannel(id, type, data) {
    var message = {
      'id': id,
      'type': type,
      'data': data
    };

    this.rtc.sendToAll('data', message);
  }
}

// module.exports = Comms;
