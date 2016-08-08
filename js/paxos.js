'use strict';
const TIMEOUT = 3000;
// NOTES
// could write function majority which checks current list of connections
// this would require responses to hold node ids

class Paxos {
  constructor(options) {
    this.id = options.id;
    //this.comms = options.comms;
    this.correct_val = null;
    this.promised_val = null; // {seq => {default: {}, responses: []} }
    this.active_proposals = [];
    this.last_seq = null;

    // Listen for events from peers
    this.comms.peer.on('connection', this.receiveEvent);
  }

  newProposal() {
    // state = get state of the current video
    seq = {time: (new Date).getTime(), id: this.id}
    return {seq: seq, val: state}
  }

  sendPrepare() {
    proposal = newProposal()
    sendToAll('PREPARE', proposal)
  }

  receivePrepare(proposer, proposal) {
    if(Paxos.sequenceGt(proposal.seq, this.last_seq)) {
      sendResponse(proposer, proposal.seq.time, {seq: this.last_seq, val: this.promised_val})
      if(this.promised_val == null){
        this.promised_val = proposal.val
        this.last_seq = proposal.seq
      }
    }
  }

  sendResponse(proposer, proposal_key, promised_proposal){
    sendToNode(proposer, 'RESPONSE', proposal_key, promised_proposal)
  }

  receiveResponse(proposal_key, promised_proposal) {
    if(this.current_proposals[proposal_key]){
      this.current_proposals[proposal_key].responses.push(promised_proposal)
      if(majority(this.current_proposals)) {
        sendAccept(proposal_key)
      }
    }
  }

  // the key for current proposals is the time
  sendAccept(key) {
    proposal = maxProposal(this.current_proposals[key].responses)
    if(proposal == null) {
      proposal = this.current_proposals[key].default
    }
    proposal.seq = this.current_proposals[key].default.seq
    this.current_proposals.delete(key)
    sendToAll('ACCEPT', proposal)
  }

  receiveAccept(proposal) {
    if(Paxos.sequenceGt(proposal.seq, this.last_seq)) {
      // COMMIT
      this.correct_val = proposal.val
      this.promised_val = null
      this.last_seq = proposal.seq
      }
    }
  }

  Paxos.sequenceGt(seq1, seq2) {
    if(seq1.time > seq2.time) {
      return true
    } else if (seq1.time == seq2.time && seq1.id > seq2.id) {
      return true
    } else {
      return false
    }
  }

  Paxos.maxProposal(proposals) {
    max = null
    for proposal in proposals {
      if(max == null) {
        // the final result will be null if all proposals are null
        proposal = null
      } else if Paxos.sequenceGt(proposal.seq, max.seq){
        max = proposal
      }
    }
    return max
  }

  Paxos.sendToAll(id, type, *stuff) {

  }

  Paxos.sendToNode(id, type, *stuff) {

  }

  receiveEvent(type, args) {
    switch (type) {
    case 'PREPARE':
      this.receivePrepare(args[0], args[1]);
      break;
    case 'RESPONSE':
      this.receiveResponse(args[0], args[1]);
      break;
    case 'COMMIT':
      this.receiveAccept(args[0]);
      break;
    default:
      console.error('Received an unknown event (' + type + ') from peer ' + id); // TODO no id defined
      break;
    }
  }
