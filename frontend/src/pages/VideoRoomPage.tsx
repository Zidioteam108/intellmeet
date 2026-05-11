import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { connectSocket } from '../utils/socket';
import useWebRTC from '../hooks/useWebRTC';
import VideoTile from '../components/VideoTile';
import ChatPanel from '../components/ChatPanel';

const VideoRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const [hasJoined, setHasJoined] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    joinRoom,
    leaveRoom,
    toggleMute,
    toggleCamera,
  } = useWebRTC(roomId || '', user?.name || 'Guest');

  // On page load, connect socket and join room
  useEffect(() => {
    if (!accessToken || !roomId) return;

    // Connect socket with real token
    connectSocket(accessToken);

    const join = async () => {
      await joinRoom();
      setHasJoined(true);
    };

    join();

    // When user navigates away, clean up
    return () => {
      leaveRoom();
    };
  }, [roomId, accessToken, joinRoom, leaveRoom]);

  const handleLeave = () => {
    leaveRoom();
    navigate('/meetings');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] overflow-hidden font-sans selection:bg-blue-500/30">

      {/* ── Left side: Videos ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">

        {/* Top bar */}
        <div className="h-16 bg-[#121215]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">I</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-tight">Room: {roomId}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {1 + remoteStreams.length} participant{remoteStreams.length !== 0 ? 's' : ''} Online
                </p>
              </div>
            </div>
          </div>

            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert('Invite link copied to clipboard! Share it with your friend.');
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
            >
              🔗 Invite Friend
            </button>

            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
              <button
                onClick={toggleMute}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>
              <button
                onClick={toggleCamera}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  isCameraOff ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
              >
                {isCameraOff ? '📷' : '📹'}
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  showChat ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-white/10'
                }`}
                title="Toggle Chat"
              >
                💬
              </button>
            </div>
            
            <button
              onClick={handleLeave}
              className="h-10 px-6 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg shadow-red-600/20 border border-red-500/30"
            >
              End Call
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className={`grid gap-6 w-full max-w-6xl mx-auto ${
            remoteStreams.length === 0
              ? 'max-w-3xl'
              : remoteStreams.length === 1
              ? 'grid-cols-2'
              : 'grid-cols-2 lg:grid-cols-3'
          }`}>

            {/* Local video (your own camera) */}
            <VideoTile
              stream={localStream}
              label={`${user?.name || 'You'} (You)`}
              isMuted={true}
              isCameraOff={isCameraOff}
            />

            {/* Remote videos (other participants) */}
            {remoteStreams.map((remote) => (
              <VideoTile
                key={remote.socketId}
                stream={remote.stream}
                label={remote.userName}
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

      {/* ── Right side: Chat ─────────────────────────────────────── */}
      {showChat && (
        <div className="w-96 flex-shrink-0 border-l border-white/5 bg-[#121215]/50 backdrop-blur-3xl animate-in slide-in-from-right duration-500">
          <ChatPanel
            roomId={roomId || ''}
            currentUserId={user?.id || ''}
            currentUserName={user?.name || 'Guest'}
          />
        </div>
      )}
    </div>
  );
};

export default VideoRoomPage;
