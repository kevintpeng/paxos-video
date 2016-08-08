'use strict';
const TIMEOUT = 3000;

class Paxos {
  constructor(options) {
    this.id = options.id;
    this.comms = options.comms;
    this.state = null;
    this.seq = null;
    this.current_proposal = null;
    this.accepted_seq = null;

    // Listen for events from peers
    this.comms.handleReceiveData = this.receiveEvent;
  }

  sendProposal() {
    if ((new Date).getTime() - this.current_proposal.start_time > TIMEOUT) {
      this.current_proposal = null;
    }

    if (!this.state || this.current_proposal){
      return;
    }

    this.current_proposal = {
      start_time: (new Date).getTime(),
      total: this.comms.peers.length,
      promise: [],
      reject: [],
      response_tuples: [{ state: this.state, seq: this.seq }]
    };

    this.seq = {
      time: this.current_proposal['start_time'],
      id: this.id
    }; // tuple, for absolute uniqueness

    this.comms.sendDataToChannel('PROPOSE', { state: this.state, seq: this.seq });
  }

  receiveEvent(event) {
    var id = event.data['id'];
    var data = event.data;
    console.log('Receiving event from ' + id);

    switch (data['type']) {
    case 'PROPOSE':
      this.receiveProposal(id, data['data']);
      break;
    case 'RESPONSE':
      this.receiveResponse(id, data['data']);
      break;
    case 'COMMIT':
      this.receiveCommit(id, data['data']);
      break;
    default:
      console.error('Received an unknown event (' + data['type'] + ') from peer ' + id);
      break;
    }
  }

  receiveProposal(id, proposal) {
    if (proposal.seq > this.seq) {
      this.comms.sendDataToPeer(id, 'RESPONSE', { accept: true, state: this.state, seq: proposal.seq }); // undefined state & seq if it hasn't accepted anything yet
      this.accepted_seq = proposal.seq;
    } else {
      this.comms.sendDataToPeer(id, 'RESPONSE', { accept: false, state: this.state, seq: this.seq }); // this is important because this is how newest states are communicated to old proposals
    }
  }

  receiveResponse(id, response) {
    if (!this.current_proposal || (new Date).getTime() - this.current_proposal.start_time > TIMEOUT) {
      // end current proposal
      this.current_proposal = null;
      return;
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
      this._commit()
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

  _commit() {
    // TODO: need to write edge case
    var times = this.current_proposal.response_tuples.map(function(o){ return o.seq.time; });
    var highest_sequence = Math.max.apply(Math, times);
    this.comms.sendDataToChannel('COMMIT', highest_sequence);
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Paxos;
}
