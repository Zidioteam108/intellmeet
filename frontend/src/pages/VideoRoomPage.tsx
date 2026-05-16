import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { getAllMeetings } from '../api/meetingsApi';
import { getAllMeetings, endMeeting as endMeetingApi } from '../api/meetingsApi';
import { generateSummary } from '../api/summaryApi';
import useWebRTC from '../hooks/useWebRTC';
import VideoTile from '../components/VideoTile';
import ChatPanel from '../components/ChatPanel';
import ParticipantList from '../components/ParticipantList';

interface Props {
  /** Stream already acquired in PreJoinPage — avoids restarting camera */
  initialStream?: MediaStream | null;
  initialCameraOff?: boolean;
  initialMuted?: boolean;
}

const VideoRoomPage = ({ initialStream, initialCameraOff = false, initialMuted = false }: Props) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const [hasJoined, setHasJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  // Full-screen "meeting ended" overlay state
  const [meetingEndedOverlay, setMeetingEndedOverlay] = useState(false);
  const [meetingEndedBy, setMeetingEndedBy] = useState<string>('');
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track whether we've already triggered cleanup to avoid double-calls
  const cleanedUpRef = useRef(false);

  // Is the current user the host of this meeting?
  const isHost = meetingData?.host?._id === user?.id || meetingData?.host === user?.id;

  // Initialize socket — memoised so it's created once per token
  const [countdown, setCountdown] = useState(4);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Is the current user the host of this meeting?
  const isHost = meetingData?.host?._id === user?.id || meetingData?.host === user?.id;

  // Initialize socket
  const socket = useMemo(() => {
    if (accessToken) return connectSocket(accessToken);
    return null;
  }, [accessToken]);

  const {
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
  } = useWebRTC(socket, roomId || '', user?.name || 'Guest', user?.avatar || '', initialStream, initialCameraOff, initialMuted);

  // ── Shared cleanup + redirect after meeting ends ─────────────────────────
  // Used by BOTH host (after End Meeting) and participants (on meeting-ended event).
  // The host now also listens to the meeting-ended socket event — ensuring a
  // single, unified cleanup path.
  const handleMeetingEnd = (endedBy: string, meetingId?: string, isHostEnding = false) => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    leaveRoom();
    setMeetingEndedBy(endedBy);
    setMeetingEndedOverlay(true);
    setCountdown(5);

    let secs = 5;
    countdownRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(countdownRef.current!);
        // Host goes to summary page; participants go to meetings list
        if (isHostEnding && meetingId) {
          generateSummary(meetingId)
            .then(() => navigate(`/meeting/${meetingId}/summary`))
            .catch(() => navigate('/meetings'));
        } else {
          navigate('/meetings');
        }
      }
    }, 1000);
  };

  // ── On page load: join room & register socket listeners ─────────────────

  // ─── On page load, join room ─────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken || !roomId || !socket) return;

    const join = async () => {
      try {
        // If PreJoinPage already called joinMeetingApi, skip the API call —
        // just fetch meeting data and connect socket
        await joinRoom();
        setHasJoined(true);

        const meetings = await getAllMeetings();
        const current = meetings.meetings.find((m: any) => m.roomId === roomId);
        if (current) setMeetingData(current);
      } catch (err: any) {
        const reason = err.response?.data?.reason;
        const meetId = err.response?.data?.meetingId;
        if (reason === 'ended') {
          navigate(`/meeting-error?reason=ended${meetId ? `&meetingId=${meetId}` : ''}`);
        } else if (reason === 'not-started') {
          navigate(`/meeting-error?reason=not-started`);
        } else if (reason === 'not-found') {
          navigate('/meeting-error?reason=not-found');
        } else {
          navigate('/meeting-error?reason=not-found');
        }
      }
    };

    join();

    // ── meeting-ended: fired by io.to(roomId) — received by ALL sockets ──
    // This is the SINGLE event path for both host and participants.
    // The host triggers it via "End Meeting" → server broadcasts via io.to()
    // → host socket also receives it here → unified cleanup runs.
    socket.on('meeting-ended', ({ endedBy, meetingId }: any) => {
      handleMeetingEnd(endedBy, meetingId, isHost);
    });

    socket.on('user-left', ({ socketId }: any) => {
      setPinnedId((prev) => (prev === socketId ? null : prev));
    socket.on('user-left', ({ socketId }: any) => {
      setPinnedId((prev) => (prev === socketId ? null : prev));
    });

    // ── Listen for host ending the meeting ────────────────────────────────
    socket.on('meeting-ended', () => {
      leaveRoom();
      setMeetingEndedOverlay(true);
      setCountdown(4);

      // Countdown then redirect
      let secs = 4;
      countdownRef.current = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs <= 0) {
          clearInterval(countdownRef.current!);
          navigate('/meetings');
        }
      }, 1000);
    });

    return () => {
      socket.off('user-left');
      socket.off('meeting-ended');
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (!cleanedUpRef.current) {
        leaveRoom();
      }
      leaveRoom();
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, accessToken, socket]);

  // ── Non-host: Leave Meeting ──────────────────────────────────────────────
  // ─── Non-host: Leave Meeting ──────────────────────────────────────────────
  const handleLeave = () => {
    leaveRoom();
    navigate('/meetings');
  };

  // ── Host only: End Meeting for everyone ─────────────────────────────────
  // Emits socket event → server updates DB + broadcasts to ALL (including host)
  // → host receives 'meeting-ended' event like everyone else → handleMeetingEnd
  const handleEndCall = () => {
    if (!isHost || !socket || !roomId) return;
    // Emit to server — server will do DB update and broadcast io.to(roomId)
    socket.emit('end-meeting', { roomId });
  };

  const handlePin = (socketId: string) => {
    setPinnedId((prev) => (prev === socketId ? null : socketId));
  };

  // ─── Host only: End Meeting for everyone ─────────────────────────────────
  const handleEndCall = async () => {
    if (!isHost) return;

    try {
      if (roomId) await endMeetingApi(roomId);
    } catch (err) {
      console.error('Failed to end meeting on backend', err);
    }

    // Notify all participants via socket
    if (socket && roomId) {
      socket.emit('end-meeting', { roomId });
    }

    // Host also leaves and goes to summary
    setTimeout(() => {
      leaveRoom();
      if (meetingData?._id) {
        generateSummary(meetingData._id)
          .then(() => navigate(`/meeting/${meetingData._id}/summary`))
          .catch(() => navigate('/meetings'));
      } else {
        navigate('/meetings');
      }
    }, 500);
  };

  const handlePin = (socketId: string) => {
    setPinnedId((prev) => (prev === socketId ? null : socketId));
  };

  // Reorder streams: pinned first
  const orderedRemoteStreams = [...remoteStreams].sort((a, b) => {
    if (a.socketId === pinnedId) return -1;
    if (b.socketId === pinnedId) return 1;
    return 0;
  });

  return (
    <div className="flex h-screen bg-[#0a0a0c] overflow-hidden font-sans selection:bg-blue-500/30">

      {/* ── Meeting Ended Full-Screen Overlay ─────────────────────────────── */}
      {/* ── Meeting Ended Full-Screen Overlay ──────────────────────────────── */}
      {meetingEndedOverlay && (
        <div className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 animate-in fade-in duration-500">
          {/* Icon */}
          <div className="w-24 h-24 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-2xl shadow-red-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-white text-2xl sm:text-3xl font-black tracking-tight">
              Meeting Ended
            </h2>
            {meetingEndedBy && (
              <p className="text-slate-400 font-medium text-sm sm:text-base">
                {meetingEndedBy} ended this meeting for everyone.
              </p>
            )}
              This meeting has ended
            </h2>
            <p className="text-slate-400 font-medium text-sm sm:text-base">
              The host ended this meeting for everyone.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-white text-2xl font-black">{countdown}</span>
            </div>
            <p className="text-slate-600 text-xs font-medium uppercase tracking-widest">
              Redirecting in {countdown}s
            </p>
          </div>

          <button
            id="goto-meetings-btn"
            onClick={() => {
              if (countdownRef.current) clearInterval(countdownRef.current);
              navigate('/meetings');
            }}
            onClick={() => { if (countdownRef.current) clearInterval(countdownRef.current); navigate('/meetings'); }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-2xl transition-all"
          >
            Go to My Meetings Now
          </button>
        </div>
      )}

      {/* ── Left side: Videos ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">

        {/* Top bar */}
        <div className="h-16 bg-[#121215]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-6 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-lg sm:text-xl">I</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-white font-bold text-sm tracking-tight">
                {meetingData?.title || `Room: ${roomId}`}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {1 + remoteStreams.length} participant{remoteStreams.length !== 0 ? 's' : ''} Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Copy invite link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href.replace('/live', ''));
                // Use a non-blocking toast-like indicator instead of alert
                const btn = document.getElementById('invite-btn');
                if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '🔗 Invite'; }, 2000); }
              }}
              id="invite-btn"
              className="hidden sm:flex px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
            >
              🔗 Invite
            </button>

            {/* Screen share */}
            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
              className={`hidden sm:flex px-3 py-1.5 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg transition-all ${
                isScreenSharing ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-gray-600 hover:bg-gray-500 shadow-gray-600/20'
              }`}
            >
              {isScreenSharing ? '🖥️ Stop Share' : '🖥️ Share Screen'}
            </button>

            {/* Audio/Video/Chat toggles */}
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <button
                onClick={toggleCamera}
                aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  isCameraOff ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isCameraOff ? '📷' : '📹'}
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                aria-label={showChat ? 'Close chat panel' : 'Open chat panel'}
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  showChat ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Toggle Chat"
              >
                💬
              </button>
            </div>

            {/* Leave button — available to everyone */}
            <button
              id="leave-btn"
              onClick={handleLeave}
              className="h-9 sm:h-10 px-3 sm:px-5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg border border-slate-600/30"
            >
              Leave
            </button>

            {/* End Meeting — HOST ONLY */}
            {isHost && (
              <button
                id="end-call-btn"
                onClick={handleEndCall}
                className="h-9 sm:h-10 px-3 sm:px-5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 border border-red-500/30"
                title="End call for everyone"
              >
                🔴 End Meeting
              </button>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 sm:p-6 flex items-center justify-center overflow-y-auto">
          <div className={`grid gap-4 sm:gap-6 w-full h-full max-w-6xl mx-auto ${
            pinnedId
              ? 'grid-cols-1 md:grid-cols-3 auto-rows-auto'
              : remoteStreams.length === 0
              ? 'max-w-3xl grid-cols-1'
              : remoteStreams.length === 1
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>

            {/* Local video */}
            <VideoTile
              stream={localStream}
              label={`${user?.name || 'You'} (You)`}
              isMuted={true}
              isCameraOff={isCameraOff}
              isScreenShare={isScreenSharing}
              isPinned={pinnedId === 'local'}
              onPin={() => handlePin('local')}
              avatar={user?.avatar}
            />

            {/* Remote videos */}
            {orderedRemoteStreams.map((remote) => (
              <VideoTile
                key={remote.socketId}
                stream={remote.stream}
                label={remote.userName}
                isPinned={pinnedId === remote.socketId}
                onPin={() => handlePin(remote.socketId)}
                avatar={remote.avatar}
                isCameraOff={remote.isCameraOff}
              />
            ))}
          </div>
        </div>

        {/* Joining indicator */}
        {!hasJoined && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-2xl shadow-blue-500/50">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-white text-2xl font-black">Joining Meeting...</h3>
              <p className="text-slate-400 font-medium">Setting up your secure connection</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right side: Chat & Participants ─────────────────────────────────── */}
      {/* ── Right side: Chat & Participants ────────────────────────────────── */}
      {showChat && (
        <div className="absolute inset-0 sm:relative sm:inset-auto z-40 w-full sm:w-96 flex-shrink-0 border-l border-white/5 bg-[#0a0a0c] sm:bg-[#121215]/50 backdrop-blur-3xl animate-in slide-in-from-right duration-500 flex flex-col">
          <div className="flex-1 overflow-hidden flex flex-col relative">
            <ChatPanel
              socket={socket}
              roomId={roomId || ''}
              currentUserId={user?.id || ''}
              currentUserName={user?.name || 'Guest'}
              onClose={() => setShowChat(false)}
            />
          </div>
          <ParticipantList participants={remoteStreams} localUserName={user?.name || 'You'} localAvatar={user?.avatar} />
        </div>
      )}
    </div>
  );
};

export default VideoRoomPage;
