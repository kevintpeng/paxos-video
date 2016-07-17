# paxos-video
Paxos is an algorithm to solve the consensus problem. -- [source](http://harry.me/blog/2014/12/27/neat-algorithms-paxos/), [source2](https://www.quora.com/Distributed-Systems-What-is-a-simple-explanation-of-the-Paxos-algorithm)
- process is a one of the computers in the systems
- client is not a member of the system, but instead asks the system to **read** a value or to **write** a value
- paxos describes the process which governs how the system communicates between its nodes

### reading
- client takes the value that the majority of the processes hold. Fails if not enough responses
  - contrasts a single node system. In Paxos, the client needs to observe the state the same way, but references multiple sources

### writing
- client can ask that a new value be written. Paxos processes recieve the request and respond with acceptance or rejection
  
