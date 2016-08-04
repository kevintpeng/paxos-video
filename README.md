# Paxos Video
The goal of this project it to allow clients to synchronously view a video across multiple clients, where the accepted state of the video is managed by a Paxos algorithm. Communication is handled client side using WebRTC. Initial client connection and the current peers list is managed by an Express JS server.

# Consensus Problem
A fundamental problem in distributed computing, which requires agreement among a number of processes for a single data value.
- consensus protocols must be fault tolerant, to deal with unreliability
- a candidate value is put forth, and a consensus value is agreed upon (deciding whether to commit a database transaction, synchronous clocks ...)
- a consensus protocol is correct if **agreement** is met, the value is **proposed** by some node, and all nodes eventually decide (**terminate**)

### Two-Phase Commit
1. A self assigned coordinator contacts every node, propose a value and gather boolean responses
2. if everyone agrees, commit

Solves consensus problem assuming no failures.
- If a coordinator crashes without sending all proposal messages, some nodes are blocked waiting for a response to the consensus
- If coordinator crashes sending half of commits, then some nodes are updated, others are blocked

### Three-Phase Commit
Similar to 2PC. Second phase of 2PC has two sub-phases.
1. Coordinator proposes
2. If everyone agrees, prepare to commit, communicating the result of the vote to every node
3. commit (or abort if delivery of prepare to commit to any node fails)

- If the coordinator crashes at any point, from 2 onwards, now any node can take over and coordinate.
- if a node has commited, we know that all nodes have prepared to commit already

**Problem**: network partitioning can cause inconsistenet states. In network systems, *fail-stop* isn't the only model of failures. Nodes can follow a *fail-recover* fault model. Coordinator can recover and interfere with another recovery node. Failure in this case isn't crashing, but could be instead network interuptions.

## Paxos -- [source](http://the-paper-trail.org/blog/consensus-protocols-paxos/)
- paxos adds **ordering** to the proposals to determine which proposals should be accepted.
  - proposals are tagged with **sequence numbers**, used for total order
  - an acceptor guarantees that it will not accept any more proposals ordered before its newest proposal, instead returning its highest sequence number, which the proposer uses to figure out a sufficiently high sequence number for its next proposal
  - proposers draw from disjoint sets of sequence numbers for uniqueness (one practical way is using the address value of the proposer for tie breakers, paired with an integer)
- paxos introduces **majorities**
  - for two sets of majorities, there is at least one acceptor that agrees on both
  - therefore a third majority is guaranteed to contain information about the previous two majorities
  - by having majorities, paxos guarantees that every reply will contain at least one response from the previously agreed proposal
  - before any commit is sent from a proposer, it is known what the most recently agreed proposal was
  - all acceptors promise not to accept values part of sequences less than its current highest, preventing a proposer with a low sequence number from getting its proposal accepted

### Full Spec
Paxos has self defined rounds of proposals, where the right proposal is more likely to be the first proposal submitted. If two proposals X(1, X) and (2, Y) are submitted to acceptors A, B, C there are two possible outcomes:
1. A = (1, X), B = (2, Y), C = (2, Y). B and C now ignore (1, X) and A is overwritten. Consensus reaches (2, Y)
2. A = (1, X), A = (2, Y), B = (2, Y). A is accepts Y, but propogates X's value to Y. Consensus reaches (2, X)

There are 3 classes of agents: proposers, acceptors, learners. A single process may act as more than one agent.

Choosing a value is easy if there is only a single acceptor agent. It is more resiliant if we have multiple though. A value is chosen when enough acceptor agents accept, where large enough is *majority* (>50%, since any two majorities from the same set will always have at least one overlapping agent).

Property 1: An acceptor must *accept* the first proposal it recieves. An acceptor must be able to accept more than one proposal. A proposal must have a unique number, and a value. A proposal is *chosen* when majority accept. Multiple proposals can be chosen if they all propose the same value.

Property 2: If a proposal with value `v` is chosen, then every higher-numbered proposal that is chosen has value `v`.

### Reading a Value -- [source](https://en.wikipedia.org/wiki/Paxos_(computer_science)#Basic_Paxos)
A node can query the current accepted value from all other nodes, and the accepted value is the one that the majority hold. Writing a value is more complex, with 2 multi-step phases:

### Phase 1a: Prepare
A Proposer (the leader) creates a proposal identified with a number N. This number must be greater than any previous proposal number used by this Proposer. Then, it sends a Prepare message containing this proposal to a Quorum of Acceptors. The Proposer decides who is in the Quorum.

### Phase 1b: Promise
If the proposal's number N is higher than any previous proposal number received from any Proposer by the Acceptor, then the Acceptor must return a promise to ignore all future proposals having a number less than N. If the Acceptor accepted a proposal at some point in the past, it must include the previous proposal number and previous value in its response to the Proposer.

Otherwise, the Acceptor can ignore the received proposal. It does not have to answer in this case for Paxos to work. However, for the sake of optimization, sending a denial (Nack) response would tell the Proposer that it can stop its attempt to create consensus with proposal N.

### Phase 2a: Accept Request
If a Proposer receives enough promises from a Quorum of Acceptors, it needs to set a value to its proposal. If any Acceptors had previously accepted any proposal, then they'll have sent their values to the Proposer, who now must set the value of its proposal to the value associated with the highest proposal number reported by the Acceptors. If none of the Acceptors had accepted a proposal up to this point, then the Proposer may choose any value for its proposal.

The Proposer sends an Accept Request message to a Quorum of Acceptors with the chosen value for its proposal.

### Phase 2b: Accepted
If an Acceptor receives an Accept Request message for a proposal N, it must accept it if and only if it has not already promised to any prepare proposals having an identifier greater than N. In this case, it should register the corresponding value v and send an Accepted message to the Proposer and every Learner. Else, it can ignore the Accept Request.

# Web Real-Time Communication (WebRTC)
An API definition from W3C, supports browser-to-browser applications for voice and video calling, P2P file sharing without plugins
- `getUserMedia` allows a web browser to access the camera and microphone to capture media
- `RTCPeerConnection` sets up audio/video calls
- `RTCDataChannel` allows browsers to share data via peer-to-peer
- `getStats` allows the web app to retrieve stats about WebRTC sessions

# Running Tests

1. Run `npm install` to install dependencies
2. Run `npm test`
