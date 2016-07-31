'use strict';

let chai      = require('chai'),
    assert    = chai.assert,
    expect    = chai.expect,
    path      = require('path'),
    Comms     = require(path.join(__dirname, '..', 'js', 'comms'));

describe('Comms', function() {
  let comms;

  beforeEach(() => {
    comms = new Comms({ id: 'id', room: 'room' });
  });

  describe('constructor', function() {
    it('should initialize all variables', function() {
      assert.equal('id', comms.id);
      assert.equal('room', comms.room);
      expect(comms.peers).eql([]);
      expect(comms.conns).eql({});
      expect(comms.peer).to.be.null;
    });
  });

  describe('#handlePeerConnection', function() {
    it('should add peer to peers list', function() {
      var handleConnection = comms.handlePeerConnection();
      handleConnection('12345');
      assert.include(comms.peers, '12345')
    });
  });

  describe('#handlePeerDisconnection', function() {
    it('should remove peer from peers list', function() {
      comms.peers = ['12345','123456'];

      var handleDisconnection = comms.handlePeerDisconnection();
      handleDisconnection('12345');
      expect(comms.peers).to.not.include('12345');
    });

    it('should not fail if peers is undefined', function() {
      comms.peers = undefined;

      var handleDisconnection = comms.handlePeerDisconnection();
      handleDisconnection('12345');
      expect(comms.peers).to.be.undefined;
    });

    it('should not fail if peer is not in the list', function() {
      comms.peers = ['12345'];

      var handleDisconnection = comms.handlePeerDisconnection();
      handleDisconnection('123456');
      expect(comms.peers).to.eql(['12345'])
    });
  });
});
