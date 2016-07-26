"use strict";

let assert     = require('chai').assert,
    expect     = require('chai').expect,
      path     = require('path'),
     Paxos     = require(path.join(__dirname, '..', 'js', 'paxos')),
     CommsMock = require(path.join(__dirname, 'mocks', 'comms_mock'));

describe('Paxos', function() {
  let paxos, comms;

  beforeEach(() => {
    comms = new CommsMock({ id: 'id', room: 'room' });
    paxos = new Paxos({ id: 'id', comms: comms });
  });

  describe('constructor', function() {
    it('should initialize all variables', function() {
      assert.equal('id', paxos.id);
      assert.equal(comms, paxos.comms);
      expect(paxos.state).to.be.null;
      expect(paxos.seq).to.be.null
      expect(paxos.current_proposal).to.be.null
      expect(paxos.accepted_seq).to.be.null
      assert.equal(paxos.receiveEvent, paxos.comms.peer.ons['connection']);
    });
  });

  describe('#receiveProposal', function() {
    it('should accept if greater than current sequence', function() {
      paxos.seq = 1;
      paxos.accepted_seq = 1;
      paxos.receiveProposal('id', { seq: 2 });

      var log = paxos.comms.sendDataToPeers['id'];
      assert.equal('RESPONSE', log['type']);
      expect(log['data']['accept']).to.be.true;
      expect(log['data']['state']).to.be.null;
      assert.equal(2, log['data']['seq']);
      assert.equal(2, paxos.accepted_seq);
    });

    it('should reject if less than than current sequence', function() {
      paxos.seq = 2;
      paxos.accepted_seq = 2;
      paxos.receiveProposal('id', { seq: 1 });

      var log = paxos.comms.sendDataToPeers['id'];
      assert.equal('RESPONSE', log['type']);
      expect(log['data']['accept']).to.be.false;
      expect(log['data']['state']).to.be.null;
      assert.equal(2, log['data']['seq']);
      assert.equal(2, paxos.accepted_seq);
    });

    it('should reject if equal than current sequence', function() {
      paxos.seq = 2;
      paxos.accepted_seq = 2;
      paxos.receiveProposal('id', { seq: 2 });

      var log = paxos.comms.sendDataToPeers['id'];
      assert.equal('RESPONSE', log['type']);
      expect(log['data']['accept']).to.be.false;
      expect(log['data']['state']).to.be.null;
      assert.equal(2, log['data']['seq']);
      assert.equal(2, paxos.accepted_seq);
    });
  });

  describe('#receiveCommit', function() {
    it('should accept if > than current sequence and >= to the accepted_seq', function() {
      paxos.seq = 1;
      paxos.accepted_seq = 1;
      paxos.receiveCommit('id', { seq: 2, state: 'state' });

      assert.equal('state', paxos.state);
      assert.equal(2, paxos.seq);
    });

    it('should reject if <= than current sequence', function() {
      paxos.seq = 1;
      paxos.accepted_seq = 1;
      paxos.receiveCommit('id', { seq: 1, state: 'state' });

      expect(paxos.state).to.be.null;
      assert.equal(1, paxos.seq);
    });

    it('should reject if < than accepted_seq', function() {
      paxos.seq = 1;
      paxos.accepted_seq = 2;
      paxos.receiveCommit('id', { seq: 1, state: 'state' });

      expect(paxos.state).to.be.null;
      assert.equal(1, paxos.seq);
    });
  });
});
