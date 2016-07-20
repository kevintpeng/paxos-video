class Paxos {
  constructor(options) {
    this.id = options.id;
    this.comms = options.comms;
    this.state = null;
    this.seq = null;
    this.current_proposal = null;
    this.accepted_seq = null

    // Listen for events from peers
    this.comms.peer.on('connection', this.receiveEvent);
  }

  sendProposal() {
    if (!this.state || this.current_proposal){
      return
    }

    this.current_proposal = {
      start_time: (new Date).getTime(),
      total: this.comms.peers.length,
      promise: [],
      reject: [],
      response_tuples: [{ state: this.state, seq: this.seq }]
    }

    this.seq = {
      time: this.current_proposal["start_time"],
      id: this.id
    } // tuple, for absolute uniqueness

    var peers = this.comms.peers;
    for(var peerIdx in peers) {
      var peer = peers[peerIdx];
      this.comms.sendDataToPeer(peer, 'PROPOSE', { state: this.state, seq: this.seq })
    }
  }

  receiveEvent(connection) {
    connection.on('data', function(event){
      var id = connection.label;
      console.log('Receiving event from ' + id);

      switch (event.type) {
      case 'PROPOSE':
        receiveProposal(id, event.data);
        break;
      case 'RESPONSE':
        receiveResponse(id, event.data);
        break;
      case 'COMMIT':
        receiveCommit(id, event.data);
        break;
      default:
        console.error('Received an unknown event (' + event.type + ') from peer ' + id);
        break;
      }
    });
  }

  receiveProposal(id, proposal) {
    if (proposal.seq > this.seq) {
      this.comm.sendDataToPeer(id, 'RESPONSE', { accept: true, state: this.state, seq: this.seq }) // undefined state & seq if it hasn't accepted anything yet
      this.accepted_seq = proposal.seq
    } else {
      this.comm.sendDataToPeer(id, 'RESPONSE', { accept: false, state: this.state, seq: this.seq }) // this is important because this is how newest states are communicated to old proposals
    }
  }

  receiveResponse(id, response) {
    if (!this.current_proposal || current_time > this.current_proposal.start_time + 3000) {
      // end current proposal
      this.current_proposal = null;
      return
    }

    if (response.accept) {
      this.current_proposal.promise.push(id);
    } else {
      this.current_proposal.reject.push(id);
    }
    this.current_proposal.response_tuples.push(response);

    var promiseCount = this.current_proposal.promise.length;
    var rejectionCount = this.current_proposal.reject.length;

    if (promiseCount / this.current_proposal.total > 0.5) {
      // TODO: need to write edge case
      var times = this.current_proposal.response_tuples.map(function(o){ return o.seq.time; });
      var highest_sequence = Math.max.apply(Math, times);
      var peers = this.comms.peers;
      for (var peerIdx in peers) {
        var peer = peers[peerIdx];
        this.comms.sendDataToPeer(peer, 'COMMIT', highest_sequence);
      }
    } else if (promiseCount + rejectionCount == this.current_proposal.total) {
      // We've received all responses, but they did not reach majority, reset proposal
      this.current_proposal = null;
    }
  }

  receiveCommit(id, proposal) {
    if (proposal.seq > this.seq && proposal.seq >= this.accepted_seq) {
      this.state = proposal.state;
      this.seq = proposal.seq;
      this.accepted_seq = null;
    }
  }
}