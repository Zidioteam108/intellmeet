# WebRTC (Web Real-Time Communication) Research Notes

## 1. What is WebRTC?
WebRTC is an open-source project that provides web browsers and mobile applications with real-time communication (RTC) via simple application programming interfaces (APIs). It allows audio and video communication to work inside web pages by allowing direct peer-to-peer communication, eliminating the need to install plugins or download native apps.

## 2. Core Components

### A. Signaling
WebRTC does not include a signaling standard. It is the process of coordinating communication. To set up a call, two devices need to exchange:
- **Control messages**: to open or close communication.
- **Error messages**.
- **Media metadata**: codecs, settings, bandwidth, etc.
- **Network data**: IP address and port.

Common signaling transport: **WebSockets**, gRPC, or even XMPP.

### B. SDP (Session Description Protocol)
SDP is a standard for describing the multimedia communication sessions. It is used to negotiate the parameters of the connection (codecs, resolution, etc.) through an "Offer/Answer" model.

### C. ICE (Interactive Connectivity Establishment)
ICE is a framework used to find the best way for two peers to connect. It tries to connect directly first, but if that fails (e.g., due to NATs/Firewalls), it uses STUN or TURN servers.

### D. STUN (Session Traversal Utilities for NAT)
STUN servers allow peers to find out their public IP address and port. Most WebRTC calls use STUN.

### E. TURN (Traversal Using Relays around NAT)
If a direct connection fails (Symmetric NAT), a TURN server acts as a relay, passing all data between the peers. This is a fallback and consumes more bandwidth/resources.

## 3. The Connection Flow (Offer/Answer)
1. **Peer A** creates an **Offer** (SDP).
2. **Peer A** sets the Offer as its *LocalDescription*.
3. **Peer A** sends the Offer to **Peer B** via the **Signaling Server**.
4. **Peer B** receives the Offer and sets it as its *RemoteDescription*.
5. **Peer B** creates an **Answer** (SDP).
6. **Peer B** sets the Answer as its *LocalDescription*.
7. **Peer B** sends the Answer to **Peer A** via the **Signaling Server**.
8. **Peer A** receives the Answer and sets it as its *RemoteDescription*.
9. Meanwhile, both peers exchange **ICE Candidates** as they are discovered.

## 4. Network Architectures

### Peer-to-Peer (Mesh)
- Every peer connects to every other peer.
- **Pros**: Low cost, low latency.
- **Cons**: High CPU/Bandwidth usage for the client (N-1 connections). Hard to scale beyond 3-4 users.

### SFU (Selective Forwarding Unit)
- Every peer sends its stream to a central server.
- The server forwards the streams to other peers without processing them.
- **Pros**: Scales better than Mesh, less client bandwidth.
- **Cons**: Server costs, slightly higher latency.

### MCU (Multipoint Control Unit)
- The server receives all streams, mixes them into a single video/audio stream, and sends it back to everyone.
- **Pros**: Lowest client-side resource usage.
- **Cons**: Extremely high server CPU cost, high latency.

## 5. Security
- **SRTP (Secure Real-time Transport Protocol)**: All WebRTC traffic is encrypted by default.
- **DTLS (Datagram Transport Layer Security)**: Used for key exchange.
- **Permissions**: Browsers require explicit user permission to access camera/microphone.

## 6. Useful Libraries
- **Frontend**: Simple-WebRTC, PeerJS, Socket.io (for signaling).
- **Backend (SFU)**: MediaSoup, Janus, Kurento, Jitsi.


## Day 2 — getUserMedia() Test Results


### Test Date: 07/05/2026

### What I Learned:- getUserMedia() returns a Promise that resolves to a MediaStream object- The MediaStream contains video tracks and audio tracks separately- You must attach the stream to a <video> element using videoEl.srcObject = stream- Stopping each track individually is required to turn off the camera light- Errors: NotAllowedError = permission denied, NotFoundError = no camera

### Stream Details Observed:- Stream ID: [paste from browser console]- Video track: [e.g., FaceTime HD Camera]- Audio track: [e.g., Built-in Microphone]

### What RTCPeerConnection will do next (Day 4):- Take this same stream and send it to another browser- The STUN server (stun:stun.l.google.com:19302) helps both browsers find each other- Socket.io (from backend) will carry the "offer" and "answer" signals