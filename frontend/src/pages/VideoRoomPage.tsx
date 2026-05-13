import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectSocket, disconnectSocket } from '../utils/socket';
import { joinMeeting as joinMeetingApi, getAllMeetings, endMeeting as endMeetingApi } from '../api/meetingsApi';
import { generateSummary } from '../api/summaryApi';
import useWebRTC from '../hooks/useWebRTC';
import VideoTile from '../components/VideoTile';
import ChatPanel from '../components/ChatPanel';
import ParticipantList from '../components/ParticipantList';

const VideoRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const [hasJoined, setHasJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [meetingData, setMeetingData] = useState<any>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

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
  } = useWebRTC(socket, roomId || '', user?.name || 'Guest', user?.avatar || '');

  // On page load, join room
  useEffect(() => {
    if (!accessToken || !roomId || !socket) return;

    const join = async () => {
      try {
        await joinMeetingApi(roomId);
        await joinRoom();
        setHasJoined(true);

        const meetings = await getAllMeetings();
        const current = meetings.meetings.find((m: any) => m.roomId === roomId);
        if (current) setMeetingData(current);
      } catch (err: any) {
        console.error('Failed to join meeting', err);
        alert(err.response?.data?.message || 'Failed to join meeting. It may have ended.');
        navigate('/meetings');
      }
    };

    join();

    socket.on('user-left', ({ socketId }: any) => {
      // If pinned user left, unpin
      setPinnedId((prev) => prev === socketId ? null : prev);
    });

    // Listen for host ending the meeting
    socket.on('meeting-ended', () => {
      alert('Meeting ended by host.');
      leaveRoom();
      navigate('/meetings');
    });

    return () => {
      socket.off('user-left');
      socket.off('meeting-ended');
      leaveRoom();
      disconnectSocket();
    };
  }, [roomId, accessToken, socket, joinRoom, leaveRoom, navigate]);

  // Host leaves → generate summary + navigate
  const handleLeave = async () => {
    leaveRoom();
    navigate('/meetings');
  };

  // Host-only: End the call for everyone
  const handleEndCall = async () => {
    if (!isHost) return;

    try {
      // Call backend to update meeting status to 'ended'
      if (roomId) {
        await endMeetingApi(roomId);
      }
    } catch (err) {
      console.error('Failed to end meeting on backend', err);
    }

    // Notify all participants
    if (socket && roomId) {
      socket.emit('end-meeting', { roomId });
    }

    // Small delay to ensure the 'end-meeting' socket event is sent before we disconnect
    setTimeout(() => {
      leaveRoom();

      // Generate AI summary if meeting data exists
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

      {/* ── Left side: Videos ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">

        {/* Top bar */}
        <div className="h-16 bg-[#121215]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-6 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-lg sm:text-xl">I</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-white font-bold text-sm tracking-tight">Room: {roomId}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
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
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Invite link copied to clipboard! Share it with your friend.');
              }}
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
              onClick={handleLeave}
              className="h-9 sm:h-10 px-3 sm:px-5 bg-slate-700 hover:bg-slate-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg border border-slate-600/30"
            >
              Leave
            </button>

            {/* End Call — HOST ONLY */}
            {isHost && (
              <button
                onClick={handleEndCall}
                className="h-9 sm:h-10 px-3 sm:px-5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 border border-red-500/30 animate-in fade-in duration-500"
                title="End call for everyone and generate AI summary"
              >
                🔴 End Call
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

            {/* Local video (your own camera) */}
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

            {/* Remote videos (other participants) */}
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

        {/* Floating Join Indicator */}
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

      {/* ── Right side: Chat & Participants ──────────────────────── */}
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
