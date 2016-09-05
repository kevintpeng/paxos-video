'use strict';

class Comms {
  constructor(options) {
    this.id = options.id;
    this.room = options.room;
    this.channel = null;

    this.pusher = null;
    this.members = [];
  }

  connect() {
    this.pusher = new Pusher('a067c1d86efea8a389b5', {
      authEndpoint: "http://localhost:9000/pusher/auth",
      auth: { params: { user_id: this.id } },
      wsHost: 'paxos-poxa.herokuapp.com',
      wsPort: 80,
      enabledTransports: ["ws", "flash"],
      disabledTransports: ["flash"],
      disableStats: true
    });
    this.channel = this.pusher.subscribe("presence-" + this.room);
    this.setupChannelBindings();
    this.pusher.bind('client-data', function(data) {
      console.log(data.data);
      window.appendText(data)
    });
  }

  setupChannelBindings() {
    var comms = this;
    this.channel.bind('pusher:subscription_succeeded', function(members) {
      members.each(function(member) {
        comms.members.push(member);
      });
    })
    this.channel.bind('pusher:member_added', function(member) {
      comms.members.push(member);
    });
    this.channel.bind('pusher:member_removed', function(member) {
      comms.members = comms.members.filter(function(comm_member) {
        return comm_member.id != member.id;
      });
    });
  }

  sendDataToChannel(type, data) {
    var message = {
      'id': this.id,
      'type': type,
      'data': data
    };

    this.channel.trigger('client-data', message);
    window.appendText(message);
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Comms;
}