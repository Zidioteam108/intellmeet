import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

// ICE server config — tells WebRTC where to find the STUN server
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface RemoteStream {
  socketId: string;
  stream: MediaStream;
  userName: string;
  avatar?: string;
  isCameraOff?: boolean;
}

const useWebRTC = (socket: Socket | null, roomId: string, userName: string, avatar: string = '') => {
  // Local camera and mic stream
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // All remote video streams from other participants
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  // Track whether user is muted
  const [isMuted, setIsMuted] = useState(false);

  // Track whether camera is off
  const [isCameraOff, setIsCameraOff] = useState(false);

  // Store all peer connections — one per remote participant
  // key = socketId of remote user, value = RTCPeerConnection
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Keep a ref to local stream for access inside event handlers
  const localStreamRef = useRef<MediaStream | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Step A — Get camera and microphone
  // ─────────────────────────────────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('Camera/mic access error:', error.message);
      // If camera fails, try audio only
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioOnly;
        setLocalStream(audioOnly);
        setIsCameraOff(true); // Automatically set camera off since we don't have video
        return audioOnly;
      } catch {
        return null;
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Step B — Create a peer connection for a specific remote user
  // ─────────────────────────────────────────────────────────────────────────
  const createPeerConnection = useCallback((remoteSocketId: string, remoteUserName: string, remoteAvatar: string = '', remoteIsCameraOff?: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // When ICE candidates are found, send to remote user via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // When remote video/audio arrives, add to remoteStreams state
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStreams((prev) => {
        const exists = prev.find((r) => r.socketId === remoteSocketId);
        if (exists) return prev;
        return [...prev, { socketId: remoteSocketId, stream, userName: remoteUserName, avatar: remoteAvatar, isCameraOff: remoteIsCameraOff }];
      });
    };

    // Add local tracks to this peer connection
    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    peerConnections.current.set(remoteSocketId, pc);
    return pc;
  }, [socket]);

  // ─────────────────────────────────────────────────────────────────────────
  // Step C — Listen to Socket.io events
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    // When a NEW user joins the room, we (the existing user) create an offer
    const handleUserJoined = async ({ socketId, userName: remoteUserName, avatar: remoteAvatar, isCameraOff: remoteIsCameraOff }: any) => {
      console.log('User joined:', remoteUserName, socketId);

      const pc = createPeerConnection(socketId, remoteUserName, remoteAvatar, remoteIsCameraOff);

      // Create an offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to the new user, including OUR details
      socket.emit('offer', { to: socketId, offer, userName, avatar, isCameraOff });
    };

    // When we receive an offer from another user, create an answer
    const handleOffer = async ({ from, offer, userName: remoteUserName, avatar: remoteAvatar, isCameraOff: remoteIsCameraOff }: any) => {
      const pc = createPeerConnection(from, remoteUserName || 'Remote User', remoteAvatar, remoteIsCameraOff);

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', { to: from, answer });
    };

    // When we receive an answer, set it as the remote description
    const handleAnswer = async ({ from, answer }: any) => {
      const pc = peerConnections.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    // When we receive an ICE candidate, add it to the right peer connection
    const handleIceCandidate = async ({ from, candidate }: any) => {
      const pc = peerConnections.current.get(from);
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    // When a user leaves, remove their stream
    const handleUserLeft = ({ socketId }: any) => {
      const pc = peerConnections.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(socketId);
      }
      setRemoteStreams((prev) => prev.filter((r) => r.socketId !== socketId));
    };

    const handleCameraToggle = ({ socketId, isCameraOff }: any) => {
      setRemoteStreams((prev) =>
        prev.map((r) =>
          r.socketId === socketId ? { ...r, isCameraOff } : r
        )
      );
    };

    // Attach event listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('user-camera-toggle', handleCameraToggle);

    return () => {
      // Remove listeners when component unmounts
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('user-camera-toggle', handleCameraToggle);
    };
  }, [socket, roomId, createPeerConnection]);

  // ─────────────────────────────────────────────────────────────────────────
  // Step D — Join the room after local stream is ready
  // ─────────────────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    const stream = await startLocalStream();
    if (!stream) return;

    if (socket) {
      socket.emit('join-room', { roomId, userName, avatar, isCameraOff });
    }
  }, [socket, roomId, userName, avatar, isCameraOff, startLocalStream]);

  // ─────────────────────────────────────────────────────────────────────────
  // Step E — Mute/unmute audio
  // ─────────────────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Step F — Turn camera on/off
  // ─────────────────────────────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((prev) => {
      const newState = !prev;
      if (socket) {
        socket.emit('toggle-camera', { roomId, isCameraOff: newState });
      }
      return newState;
    });
  }, [socket, roomId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Step G — Leave room and clean up
  // ─────────────────────────────────────────────────────────────────────────
  const leaveRoom = useCallback(() => {
    // Stop all media tracks
    localStreamRef.current?.getTracks().forEach((track) => track.stop());

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Reset state
    setLocalStream(null);
    setRemoteStreams([]);

    if (socket) {
      socket.emit('leave-room', { roomId });
    }
  }, [socket, roomId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Screen Sharing — replaces camera with screen stream
  // ─────────────────────────────────────────────────────────────────────────
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const startScreenShare = useCallback(async () => {
    try {
      // Ask browser to show the screen picker dialog
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace the camera video track in all peer connections
      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // Show screen in local video
      setLocalStream(screenStream);
      setIsScreenSharing(true);

      // When user stops sharing from browser button
      screenTrack.onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Screen share error:', err);
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const cameraTrack = cameraStream.getVideoTracks()[0];

    peerConnections.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(cameraTrack);
    });

    setLocalStream(cameraStream);
    localStreamRef.current = cameraStream;
    setIsScreenSharing(false);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Return everything the component needs
  // ─────────────────────────────────────────────────────────────────────────
  return {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
  };
};

export default useWebRTC;
