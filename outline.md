`Comms.js`
---
- `connect()` will create a connection to the PeerJS server
- Upon connection or disconnection of another peer, a peers array (`window.peers`) will be updated to track the other peers in a "room"
- Has methods to `receiveData` from another peer or `sendData` to 1..n peers.

`Paxos.js`
---
- 3 events, `PROPOSAL`, `COMMIT`, `REJECT`
- The `LEADER` will send a proposal hash `{ 'type' : 'PROPOSAL', 'state' :  X }` to all other peers.
 - The other peers will respond with a `true` or `false`.
 - If the majority of peers respond true, then the `LEADER` will respond with a commit hash `{ 'type' : 'COMMIT', 'state' :  X }`
   - All peers will update their state to be X
 - Otherwise, it will respond with a rejection hash `{ 'type' : 'REJECT', 'state' :  X }`
   - All peers will acknowledge the rejection.
- Paxos dictates that many of these requests can go on, so the "sequence" will be set in such a way so that it will be increasing
   - The sequence might be determined by a timestamp, but JS times would be subjected to time drift and inaccurate client times
   - Could start with "sequence" `1` and require an increasing number - peers would reject duplicate sequences.
    - This requires the client to remember the highest sequence achieved.
- We can constantly be syncing p2p without issue.
- `Paxos.js` will use `comms.js` `sendData` to send out the requests to all peers and respond using the ID of the leader peer.
- `comms.js` receiving data will simply pass this to `paxos.js` to handle the incoming hash. This way `comms.js` doesn't care about `paxos.js` stuff and it is almost entirely decoupled (other than passing the leader id from paxos to comms)

MVP
---
- An input allowing us to define a current "state"
- A "propose" button which allows us to propose to other peers whatever state is in the input.
 - Other peers would check this state against the state in their input and respond accordingly with a yes or no
- All interactions would be logged in a `div`
- If a commit message is received, all peers will update their state and the corresponding input
