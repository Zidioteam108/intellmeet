import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

// ICE server config — tells WebRTC where to find the STUN server
const ICE_SERVERS: RTCConfiguration = {
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

const useWebRTC = (
  socket: Socket | null,
  roomId: string,
  userName: string,
  avatar: string = '',
  /** Pre-acquired stream from PreJoinPage — skip getUserMedia if provided */
  initialStream?: MediaStream | null,
  initialCameraOff?: boolean,
  initialMuted?: boolean,
) => {
  // ─── State ────────────────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(initialStream ?? null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isMuted, setIsMuted] = useState(initialMuted ?? false);
  const [isCameraOff, setIsCameraOff] = useState(initialCameraOff ?? false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // ─── Refs (stable across renders — critical for socket callbacks) ──────
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(initialStream ?? null);
  const hasInitialStream = useRef<boolean>(!!initialStream);

  // Volatile values used inside socket callbacks — access via ref so
  // the socket listeners never need to be re-attached when these change.
  const userNameRef = useRef(userName);
  const avatarRef = useRef(avatar);
  const isCameraOffRef = useRef(initialCameraOff ?? false);

  // Keep refs in sync with latest props/state
  useEffect(() => { userNameRef.current = userName; }, [userName]);
  useEffect(() => { avatarRef.current = avatar; }, [avatar]);
  useEffect(() => { isCameraOffRef.current = isCameraOff; }, [isCameraOff]);

  // Queue ICE candidates that arrive before setRemoteDescription
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // ─────────────────────────────────────────────────────────────────────────
  // Step A — Get camera and microphone (skipped if initialStream provided)
  // ─────────────────────────────────────────────────────────────────────────
  const startLocalStream = useCallback(async () => {
    if (hasInitialStream.current && localStreamRef.current) {
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error: any) {
      console.error('Camera/mic access error:', error.message);
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioOnly;
        setLocalStream(audioOnly);
        setIsCameraOff(true);
        return audioOnly;
      } catch {
        return null;
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Step B — Create a peer connection for a specific remote user
  // ─────────────────────────────────────────────────────────────────────────
  const createPeerConnection = useCallback((
    remoteSocketId: string,
    remoteUserName: string,
    remoteAvatar: string = '',
    remoteIsCameraOff?: boolean,
  ) => {
    // If a connection already exists, close and replace it
    if (peerConnections.current.has(remoteSocketId)) {
      peerConnections.current.get(remoteSocketId)!.close();
      peerConnections.current.delete(remoteSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);

    // ── ICE candidates → send to remote via socket ────────────────────────
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // ── Remote tracks arrive → add to React state ─────────────────────────
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;
      setRemoteStreams((prev) => {
        const exists = prev.find((r) => r.socketId === remoteSocketId);
        if (exists) return prev;
        return [
          ...prev,
          {
            socketId: remoteSocketId,
            stream,
            userName: remoteUserName,
            avatar: remoteAvatar,
            isCameraOff: remoteIsCameraOff,
          },
        ];
      });
    };

    // ── Connection state logging ──────────────────────────────────────────
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${remoteSocketId} connection: ${pc.connectionState}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        // Cleanup stale connection
        pc.close();
        peerConnections.current.delete(remoteSocketId);
        setRemoteStreams((prev) => prev.filter((r) => r.socketId !== remoteSocketId));
      }
    };

    // ── Add local tracks BEFORE creating offer/answer ─────────────────────
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    peerConnections.current.set(remoteSocketId, pc);
    return pc;
  }, [socket]);

  // ─── Helper: flush queued ICE candidates after setRemoteDescription ────
  const flushCandidates = useCallback(async (socketId: string) => {
    const queued = pendingCandidates.current.get(socketId);
    if (!queued || queued.length === 0) return;
    const pc = peerConnections.current.get(socketId);
    if (!pc) return;
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('[WebRTC] Failed to add queued ICE candidate:', e);
      }
    }
    pendingCandidates.current.delete(socketId);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Step C — Socket event listeners (attached ONCE when socket+roomId exist)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    // ── user-joined: a NEW user joined → we (existing) create an offer ────
    const handleUserJoined = async ({
      socketId,
      userName: remoteUserName,
      avatar: remoteAvatar,
      isCameraOff: remoteIsCameraOff,
    }: any) => {
      console.log('[WebRTC] user-joined:', remoteUserName, socketId);

      const pc = createPeerConnection(socketId, remoteUserName, remoteAvatar, remoteIsCameraOff);

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer with OUR current metadata (read from refs, not stale closure)
        socket.emit('offer', {
          to: socketId,
          offer,
          userName: userNameRef.current,
          avatar: avatarRef.current,
          isCameraOff: isCameraOffRef.current,
        });
      } catch (err) {
        console.error('[WebRTC] Failed to create offer:', err);
      }
    };

    // ── offer: we received an offer → create answer ───────────────────────
    const handleOffer = async ({
      from,
      offer,
      userName: remoteUserName,
      avatar: remoteAvatar,
      isCameraOff: remoteIsCameraOff,
    }: any) => {
      console.log('[WebRTC] offer received from:', from);

      const pc = createPeerConnection(
        from,
        remoteUserName || 'Remote User',
        remoteAvatar,
        remoteIsCameraOff,
      );

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        // Flush any ICE candidates that arrived before this
        await flushCandidates(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', { to: from, answer });
      } catch (err) {
        console.error('[WebRTC] Failed to handle offer:', err);
      }
    };

    // ── answer: our offer was accepted → set remote description ───────────
    const handleAnswer = async ({ from, answer }: any) => {
      console.log('[WebRTC] answer received from:', from);
      const pc = peerConnections.current.get(from);
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await flushCandidates(from);
        } catch (err) {
          console.error('[WebRTC] Failed to set remote description:', err);
        }
      }
    };

    // ── ice-candidate: queue or add immediately ───────────────────────────
    const handleIceCandidate = async ({ from, candidate }: any) => {
      if (!candidate) return;
      const pc = peerConnections.current.get(from);

      // If PC doesn't exist yet or remote description not set, queue it
      if (!pc || !pc.remoteDescription) {
        if (!pendingCandidates.current.has(from)) {
          pendingCandidates.current.set(from, []);
        }
        pendingCandidates.current.get(from)!.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn('[WebRTC] Failed to add ICE candidate:', err);
      }
    };

    // ── user-left: clean up peer connection ───────────────────────────────
    const handleUserLeft = ({ socketId }: any) => {
      console.log('[WebRTC] user-left:', socketId);
      const pc = peerConnections.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(socketId);
      }
      pendingCandidates.current.delete(socketId);
      setRemoteStreams((prev) => prev.filter((r) => r.socketId !== socketId));
    };

    // ── camera toggle from remote user ────────────────────────────────────
    const handleCameraToggle = ({ socketId, isCameraOff }: any) => {
      setRemoteStreams((prev) =>
        prev.map((r) =>
          r.socketId === socketId ? { ...r, isCameraOff } : r
        )
      );
    };

    // Attach listeners
    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('user-camera-toggle', handleCameraToggle);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('user-camera-toggle', handleCameraToggle);
    };
    // CRITICAL: only re-run when socket or roomId changes.
    // userName/avatar/isCameraOff are read from refs inside the callbacks.
  }, [socket, roomId, createPeerConnection, flushCandidates]);

  // ─────────────────────────────────────────────────────────────────────────
  // Step D — Join the room after local stream is ready
  // ─────────────────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    const stream = await startLocalStream();
    if (!stream) return;

    if (socket) {
      socket.emit('join-room', {
        roomId,
        userName: userNameRef.current,
        avatar: avatarRef.current,
        isCameraOff: isCameraOffRef.current,
      });
    }
  }, [socket, roomId, startLocalStream]);

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
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    setLocalStream(null);
    setRemoteStreams([]);
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
  }, [socket, roomId]);

  // ─────────────────────────────────────────────────────────────────────────
  // Screen Sharing
  // ─────────────────────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = screenStream.getVideoTracks()[0];

      peerConnections.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(screenTrack);
      });

      setLocalStream(screenStream);
      setIsScreenSharing(true);

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
