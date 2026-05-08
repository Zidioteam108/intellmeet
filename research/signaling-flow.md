# WebRTC Signaling Flow — Socket.io

## What is Signaling?
WebRTC can send video directly between two browsers (peer-to-peer), but first
both browsers need to "find each other" and agree on connection details.
This is called signaling. Socket.io handles the signaling messages.

## Key Terms

### SDP (Session Description Protocol)
An "offer" and "answer" are both SDP objects. They contain technical details
about what codecs (video/audio formats) the browser supports, IP addresses,
ports, etc. Think of it as two people agreeing on a language before talking.

### ICE Candidates
After the SDP exchange, browsers send each other their ICE candidates —
potential network paths (IP + port combinations) through which they can connect.
The STUN server helps discover the public-facing ICE candidates.

### STUN Server Role
stun:stun.l.google.com:19302 tells Browser A: "Your public IP is X.X.X.X"
And tells Browser B: "Your public IP is Y.Y.Y.Y"
Then they try connecting to each other directly.

## Socket.io Events Our App Will Use

| Event Name        | Direction         | What it carries          |
|-------------------|-------------------|--------------------------|
| join-room         | Client → Server   | { roomId, userId }       |
| user-joined       | Server → Clients  | { userId }               |
| offer             | Client → Server   | { to, offer (SDP) }      |
| answer            | Client → Server   | { to, answer (SDP) }     |
| ice-candidate     | Client → Server   | { to, candidate }        |
| user-left         | Server → Clients  | { userId }               |

## Full Step-by-Step Flow

1. Person A opens meeting room
   → emits `join-room` with roomId
   → Server puts A in a Socket.io room

2. Person B opens same meeting room
   → emits `join-room` with same roomId
   → Server notifies A: `user-joined` with B's socketId

3. Person A creates RTCPeerConnection
   → calls getUserMedia() to get camera stream
   → creates offer: `const offer = await pc.createOffer()`
   → sets local description: `await pc.setLocalDescription(offer)`
   → emits `offer` event to Server with the SDP

4. Server forwards offer to Person B

5. Person B receives offer
   → creates RTCPeerConnection
   → sets remote description with A's offer
   → calls getUserMedia() to get own camera
   → creates answer: `const answer = await pc.createAnswer()`
   → sets local description with answer
   → emits `answer` back to Server

6. Server forwards answer to Person A

7. Person A sets remote description with B's answer

8. Both sides emit `ice-candidate` events as they are generated
   → Server forwards each candidate to the other side
   → Each side calls `pc.addIceCandidate(candidate)` when received

9. CONNECTION ESTABLISHED — video flows peer-to-peer!

## Code Snippet to Study (NOT for production — just for learning)

```javascript
// ─── Person A: Creating and sending an offer ───
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// When ICE candidates are generated, send them via socket
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('ice-candidate', { to: remotePeerId, candidate: event.candidate });
  }
};

// When remote stream arrives, show it in <video> element
pc.ontrack = (event) => {
  remoteVideoElement.srcObject = event.streams[0];
};

// Add local stream tracks to the connection
const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

// Create and send offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
socket.emit('offer', { to: remotePeerId, offer });
```

## What to Build Tomorrow (Day 4)
- Backend: Add Socket.io event handlers for join-room, offer, answer, ice-candidate
- Test with two browser tabs that both join the same room