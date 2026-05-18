import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';

const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const turnUrls = import.meta.env.VITE_TURN_URLS;
  if (turnUrls) {
    servers.push({
      urls: turnUrls.split(',').map((url: string) => url.trim()).filter(Boolean),
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    });
  }

  return servers;
};

const ICE_CONFIG: RTCConfiguration = {
  iceServers: getIceServers(),
};

interface RemoteStream {
  socketId: string;
  stream: MediaStream;
  userName: string;
  avatar?: string;
  isCameraOff?: boolean;
  isScreenSharing?: boolean;
}

interface PeerMetaPayload {
  socketId: string;
  userName?: string;
  avatar?: string;
  isCameraOff?: boolean;
}

interface OfferPayload {
  from: string;
  offer: RTCSessionDescriptionInit;
  userName?: string;
  avatar?: string;
  isCameraOff?: boolean;
}

interface AnswerPayload {
  from: string;
  answer: RTCSessionDescriptionInit;
}

interface IceCandidatePayload {
  from: string;
  candidate?: RTCIceCandidateInit;
}

interface UserLeftPayload {
  socketId: string;
}

interface CameraTogglePayload {
  socketId: string;
  isCameraOff: boolean;
}

interface ScreenShareTogglePayload {
  socketId: string;
  isScreenSharing: boolean;
}

const setMediaTrackEnabled = (track: MediaStreamTrack | null, enabled: boolean) => {
  if (track) track.enabled = enabled;
};

const getVideoSender = (pc: RTCPeerConnection) =>
  pc.getSenders().find((sender) => sender.track?.kind === 'video') ??
  pc.getTransceivers().find((transceiver) => transceiver.receiver.track.kind === 'video')?.sender;

const useWebRTC = (
  socket: Socket | null,
  roomId: string,
  userName: string,
  avatar: string = '',
  initialStream?: MediaStream | null,
  initialCameraOff?: boolean,
  initialMuted?: boolean,
) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(initialStream ?? null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isMuted, setIsMuted] = useState(initialMuted ?? false);
  const [isCameraOff, setIsCameraOff] = useState(initialCameraOff ?? false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const reconnectTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const remoteMeta = useRef<Map<string, Omit<RemoteStream, 'stream'>>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(initialStream ?? null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(initialStream?.getVideoTracks()[0] ?? null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const isScreenSharingRef = useRef(false);
  const joinedRef = useRef(false);

  const userNameRef = useRef(userName);
  const avatarRef = useRef(avatar);
  const isCameraOffRef = useRef(initialCameraOff ?? false);
  const isMutedRef = useRef(initialMuted ?? false);

  useEffect(() => { userNameRef.current = userName; }, [userName]);
  useEffect(() => { avatarRef.current = avatar; }, [avatar]);
  useEffect(() => { isCameraOffRef.current = isCameraOff; }, [isCameraOff]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  const updateLocalStream = useCallback((stream: MediaStream | null) => {
    localStreamRef.current = stream;
    setLocalStream(stream);
    cameraTrackRef.current = stream?.getVideoTracks().find((track) => track.readyState === 'live') ?? null;
  }, []);

  const startLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getAudioTracks().forEach((track) => { track.enabled = !isMutedRef.current; });
      stream.getVideoTracks().forEach((track) => { track.enabled = !isCameraOffRef.current; });
      updateLocalStream(stream);
      return stream;
    } catch (error: unknown) {
      console.error('Camera/mic access error:', error);
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioOnly.getAudioTracks().forEach((track) => { track.enabled = !isMutedRef.current; });
        setIsCameraOff(true);
        isCameraOffRef.current = true;
        updateLocalStream(audioOnly);
        return audioOnly;
      } catch (audioError) {
        console.error('Microphone access error:', audioError);
        return null;
      }
    }
  }, [updateLocalStream]);

  const upsertRemoteStream = useCallback((socketId: string, stream: MediaStream) => {
    const meta = remoteMeta.current.get(socketId) ?? {
      socketId,
      userName: 'Remote User',
      avatar: '',
      isCameraOff: false,
    };

    setRemoteStreams((prev) => {
      const existing = prev.find((remote) => remote.socketId === socketId);
      if (existing) {
        return prev.map((remote) => (
          remote.socketId === socketId ? { ...remote, ...meta, stream } : remote
        ));
      }
      return [...prev, { ...meta, stream }];
    });
  }, []);

  const addLocalTracks = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      if (!pc.getSenders().some((sender) => sender.track?.kind === 'audio')) {
        pc.addTrack(track, stream);
      }
    });

    const videoTrack = screenTrackRef.current ?? stream.getVideoTracks()[0];
    if (videoTrack && !getVideoSender(pc)) {
      pc.addTrack(videoTrack, stream);
    } else if (!videoTrack && !getVideoSender(pc)) {
      pc.addTransceiver('video', { direction: 'sendrecv' });
    }
  }, []);

  const closePeer = useCallback((socketId: string) => {
    const reconnectTimer = reconnectTimers.current.get(socketId);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimers.current.delete(socketId);
    peerConnections.current.get(socketId)?.close();
    peerConnections.current.delete(socketId);
    pendingCandidates.current.delete(socketId);
    remoteMeta.current.delete(socketId);
    setRemoteStreams((prev) => prev.filter((remote) => remote.socketId !== socketId));
  }, []);

  const createPeerConnection = useCallback((
    remoteSocketId: string,
    remoteUserName = 'Remote User',
    remoteAvatar = '',
    remoteIsCameraOff = false,
  ) => {
    remoteMeta.current.set(remoteSocketId, {
      socketId: remoteSocketId,
      userName: remoteUserName,
      avatar: remoteAvatar,
      isCameraOff: remoteIsCameraOff,
    });

    const existing = peerConnections.current.get(remoteSocketId);
    if (existing && existing.connectionState !== 'closed') {
      addLocalTracks(existing);
      return existing;
    }

    const pc = new RTCPeerConnection(ICE_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: remoteSocketId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) upsertRemoteStream(remoteSocketId, stream);
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] ${remoteSocketId} connection: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        const timer = reconnectTimers.current.get(remoteSocketId);
        if (timer) clearTimeout(timer);
        reconnectTimers.current.delete(remoteSocketId);
      }

      if (pc.connectionState === 'failed') {
        pc.restartIce?.();
      }

      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        const existingTimer = reconnectTimers.current.get(remoteSocketId);
        if (existingTimer) clearTimeout(existingTimer);
        const timer = setTimeout(() => closePeer(remoteSocketId), 10000);
        reconnectTimers.current.set(remoteSocketId, timer);
      }
    };

    addLocalTracks(pc);
    peerConnections.current.set(remoteSocketId, pc);
    return pc;
  }, [addLocalTracks, closePeer, socket, upsertRemoteStream]);

  const flushCandidates = useCallback(async (socketId: string) => {
    const queued = pendingCandidates.current.get(socketId);
    const pc = peerConnections.current.get(socketId);
    if (!queued?.length || !pc?.remoteDescription) return;

    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn('[WebRTC] Failed to add queued ICE candidate:', error);
      }
    }
    pendingCandidates.current.delete(socketId);
  }, []);

  const renegotiatePeer = useCallback(async (socketId: string) => {
    const pc = peerConnections.current.get(socketId);
    if (!pc || !socket || pc.signalingState !== 'stable') return;

    try {
      const offer = await pc.createOffer({ iceRestart: pc.iceConnectionState === 'failed' });
      await pc.setLocalDescription(offer);
      socket.emit('offer', {
        to: socketId,
        offer,
        userName: userNameRef.current,
        avatar: avatarRef.current,
        isCameraOff: isCameraOffRef.current,
      });
    } catch (error) {
      console.error('[WebRTC] Failed to renegotiate peer:', error);
    }
  }, [socket]);

  const replaceVideoTrackForAllPeers = useCallback(async (track: MediaStreamTrack | null) => {
    const updates: Promise<void>[] = [];

    peerConnections.current.forEach((pc, socketId) => {
      const sender = getVideoSender(pc);
      if (sender) {
        updates.push(sender.replaceTrack(track));
        return;
      }

      if (track && localStreamRef.current) {
        pc.addTrack(track, localStreamRef.current);
        updates.push(renegotiatePeer(socketId));
      }
    });

    await Promise.all(updates);
  }, [renegotiatePeer]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleUserJoined = async ({
      socketId,
      userName: remoteUserName,
      avatar: remoteAvatar,
      isCameraOff: remoteIsCameraOff,
    }: PeerMetaPayload) => {
      const pc = createPeerConnection(socketId, remoteUserName, remoteAvatar, remoteIsCameraOff);
      if (pc.signalingState !== 'stable') return;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          to: socketId,
          offer,
          userName: userNameRef.current,
          avatar: avatarRef.current,
          isCameraOff: isCameraOffRef.current,
        });
      } catch (error) {
        console.error('[WebRTC] Failed to create offer:', error);
      }
    };

    const handleOffer = async ({
      from,
      offer,
      userName: remoteUserName,
      avatar: remoteAvatar,
      isCameraOff: remoteIsCameraOff,
    }: OfferPayload) => {
      const pc = createPeerConnection(from, remoteUserName, remoteAvatar, remoteIsCameraOff);

      try {
        if (pc.signalingState !== 'stable') {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' } as RTCSessionDescriptionInit),
            pc.setRemoteDescription(new RTCSessionDescription(offer)),
          ]);
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
        }

        await flushCandidates(from);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { to: from, answer });
      } catch (error) {
        console.error('[WebRTC] Failed to handle offer:', error);
      }
    };

    const handleAnswer = async ({ from, answer }: AnswerPayload) => {
      const pc = peerConnections.current.get(from);
      if (!pc || pc.signalingState === 'stable') return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates(from);
      } catch (error) {
        console.error('[WebRTC] Failed to set remote description:', error);
      }
    };

    const handleIceCandidate = async ({ from, candidate }: IceCandidatePayload) => {
      if (!candidate) return;
      const pc = peerConnections.current.get(from);

      if (!pc || !pc.remoteDescription) {
        const queue = pendingCandidates.current.get(from) ?? [];
        queue.push(candidate);
        pendingCandidates.current.set(from, queue);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn('[WebRTC] Failed to add ICE candidate:', error);
      }
    };

    const handleUserLeft = ({ socketId }: UserLeftPayload) => closePeer(socketId);

    const handleCameraToggle = ({ socketId, isCameraOff }: CameraTogglePayload) => {
      const meta = remoteMeta.current.get(socketId);
      if (meta) remoteMeta.current.set(socketId, { ...meta, isCameraOff });
      setRemoteStreams((prev) =>
        prev.map((remote) => remote.socketId === socketId ? { ...remote, isCameraOff } : remote)
      );
    };

    const handleScreenShareToggle = ({ socketId, isScreenSharing }: ScreenShareTogglePayload) => {
      setRemoteStreams((prev) =>
        prev.map((remote) => remote.socketId === socketId ? { ...remote, isScreenSharing } : remote)
      );
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('user-camera-toggle', handleCameraToggle);
    socket.on('user-screen-share-toggle', handleScreenShareToggle);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('user-camera-toggle', handleCameraToggle);
      socket.off('user-screen-share-toggle', handleScreenShareToggle);
    };
  }, [closePeer, createPeerConnection, flushCandidates, roomId, socket]);

  const joinRoom = useCallback(async () => {
    const stream = await startLocalStream();
    if (!stream || !socket || !roomId || joinedRef.current) return;

    joinedRef.current = true;
    socket.emit('join-room', {
      roomId,
      userName: userNameRef.current,
      avatar: avatarRef.current,
      isCameraOff: isCameraOffRef.current,
    });
  }, [roomId, socket, startLocalStream]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const nextMuted = !isMutedRef.current;
    stream.getAudioTracks().forEach((track) => { track.enabled = !nextMuted; });
    isMutedRef.current = nextMuted;
    setIsMuted(nextMuted);
    socket?.emit('toggle-audio', { roomId, isMuted: nextMuted });
  }, [roomId, socket]);

  const toggleCamera = useCallback(() => {
    const nextCameraOff = !isCameraOffRef.current;
    const cameraTrack = cameraTrackRef.current;

    if (cameraTrack?.readyState === 'live') {
      cameraTrack.enabled = !nextCameraOff;
    } else if (!isScreenSharingRef.current) {
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = !nextCameraOff;
      });
    }

    isCameraOffRef.current = nextCameraOff;
    setIsCameraOff(nextCameraOff);
    socket?.emit('toggle-camera', { roomId, isCameraOff: nextCameraOff });
  }, [roomId, socket]);

  const stopScreenShare = useCallback(async () => {
    const screenTrack = screenTrackRef.current;
    if (!screenTrack && !isScreenSharingRef.current) return;

    screenTrackRef.current = null;
    isScreenSharingRef.current = false;

    let cameraTrack = cameraTrackRef.current;
    if (!cameraTrack || cameraTrack.readyState !== 'live') {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraTrack = cameraStream.getVideoTracks()[0] ?? null;
      } catch (error) {
        console.error('Stop screen share camera error:', error);
      }
    }

    setMediaTrackEnabled(cameraTrack, !isCameraOffRef.current);
    await replaceVideoTrackForAllPeers(cameraTrack);

    const nextStream = new MediaStream();
    localStreamRef.current?.getAudioTracks().forEach((track) => nextStream.addTrack(track));
    if (cameraTrack) nextStream.addTrack(cameraTrack);

    if (screenTrack?.readyState === 'live') screenTrack.stop();
    updateLocalStream(nextStream);
    setIsScreenSharing(false);
    socket?.emit('toggle-screen-share', { roomId, isScreenSharing: false });
  }, [replaceVideoTrackForAllPeers, roomId, socket, updateLocalStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) return;

      const currentStream = localStreamRef.current;
      if (currentStream && !screenTrackRef.current) {
        cameraTrackRef.current = currentStream.getVideoTracks()[0] ?? cameraTrackRef.current;
      }

      screenTrackRef.current = screenTrack;
      isScreenSharingRef.current = true;
      await replaceVideoTrackForAllPeers(screenTrack);

      const nextStream = new MediaStream();
      currentStream?.getAudioTracks().forEach((track) => nextStream.addTrack(track));
      nextStream.addTrack(screenTrack);
      localStreamRef.current = nextStream;
      setLocalStream(nextStream);
      setIsScreenSharing(true);
      socket?.emit('toggle-screen-share', { roomId, isScreenSharing: true });

      screenTrack.onended = () => {
        if (screenTrackRef.current === screenTrack) {
          void stopScreenShare();
        }
      };
    } catch (error) {
      console.error('Screen share error:', error);
    }
  }, [replaceVideoTrackForAllPeers, roomId, socket, stopScreenShare]);

  const leaveRoom = useCallback(() => {
    joinedRef.current = false;
    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    isScreenSharingRef.current = false;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnections.current.forEach((pc) => pc.close());
    reconnectTimers.current.forEach((timer) => clearTimeout(timer));
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    reconnectTimers.current.clear();
    remoteMeta.current.clear();
    setLocalStream(null);
    setRemoteStreams([]);
    socket?.emit('leave-room', { roomId });
  }, [roomId, socket]);

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
