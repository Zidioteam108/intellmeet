import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { joinMeeting as joinMeetingApi } from '../api/meetingsApi';
import VideoRoomPage from './VideoRoomPage';

const PreJoinPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ─── State ────────────────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Mount animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ─── Get camera / mic ─────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        setLocalStream(stream);
      } catch {
        // Camera denied — try audio only
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!active) { audioOnly.getTracks().forEach(t => t.stop()); return; }
          streamRef.current = audioOnly;
          setLocalStream(audioOnly);
          setIsCameraOff(true);
        } catch {
          setIsCameraOff(true);
        }
      }
    };
    startPreview();
    return () => {
      active = false;
      // DO NOT stop tracks here — they'll be handed off to VideoRoomPage
    };
  }, []);

  // Attach stream to preview video element
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // ─── Toggle camera ────────────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setIsCameraOff(prev => !prev);
  }, []);

  // ─── Toggle mic ───────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setIsMuted(prev => !prev);
  }, []);

  // ─── Join Meeting ─────────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!roomId) return;
    setIsJoining(true);
    setError('');
    try {
      const data = await joinMeetingApi(roomId);
      if (data?.meeting?.title) setMeetingTitle(data.meeting.title);
      // Success — enter the room (stream stays alive)
      setHasJoined(true);
    } catch (err: any) {
      const res = err.response?.data;
      if (res?.reason === 'ended') {
        navigate(`/meeting-error?reason=ended${res?.meetingId ? `&meetingId=${res.meetingId}` : ''}`);
        return;
      }
      if (res?.reason === 'not-found' || err.response?.status === 404) {
        navigate('/meeting-error?reason=not-found');
        return;
      }
      setError(res?.message || 'Failed to join meeting. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigate('/meetings');
  };

  // ─── If already joined, hand off to VideoRoomPage ─────────────────────────
  if (hasJoined) {
    return <VideoRoomPage initialStream={streamRef.current} initialCameraOff={isCameraOff} initialMuted={isMuted} />;
  }

  // ─── Pre-join UI ──────────────────────────────────────────────────────────
  const displayName = user?.name || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">

      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
      </div>

      {/* Brand header */}
      <div className={`relative z-10 flex items-center gap-3 mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-white font-black text-lg">I</span>
        </div>
        <span className="text-white/80 font-black text-lg tracking-tight">IntellMeet</span>
      </div>

      {/* Main two-column card */}
      <div className={`relative z-10 w-full max-w-4xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-2xl flex flex-col lg:flex-row">

          {/* Left — Camera preview */}
          <div className="flex-1 min-h-[280px] sm:min-h-[360px] bg-[#0d0d18] relative overflow-hidden">
            {/* Live video */}
            {!isCameraOff && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                aria-label="Camera preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0d0d18]">
                {/* Blurred avatar background */}
                {user?.avatar && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 blur-[50px] scale-125"
                    style={{ backgroundImage: `url(${user.avatar})` }}
                  />
                )}
                <div className="relative flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full border-[3px] border-white/10 shadow-2xl overflow-hidden bg-slate-800/80">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                        {initial}
                      </div>
                    )}
                  </div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Camera is off</p>
                </div>
              </div>
            )}

            {/* Name badge */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10">
              {displayName} (You)
            </div>

            {/* Camera / Mic status badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {isMuted && (
                <div className="bg-red-500/80 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-red-400/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Muted
                </div>
              )}
              {isCameraOff && (
                <div className="bg-slate-800/80 backdrop-blur-xl text-slate-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  Video Off
                </div>
              )}
            </div>
          </div>

          {/* Right — Controls panel */}
          <div className="w-full lg:w-80 flex-shrink-0 p-6 sm:p-8 flex flex-col justify-between border-l border-white/5 bg-[#0a0a14]">

            {/* Top section */}
            <div>
              {/* Room info */}
              <div className="mb-6">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ready to join</p>
                <h1 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-tight mb-1">
                  {meetingTitle || 'Meeting Room'}
                </h1>
                <p className="text-slate-500 text-xs font-medium font-mono">
                  Room: <span className="text-indigo-400">{roomId}</span>
                </p>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3 mb-6 p-3.5 rounded-2xl bg-white/[0.04] border border-white/5">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                      {initial}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{displayName}</p>
                  <p className="text-slate-500 text-[11px] font-medium truncate">{user?.email}</p>
                </div>
              </div>

              {/* Camera & Mic toggles */}
              <div className="space-y-3 mb-6">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Device Settings</p>

                {/* Camera toggle */}
                <button
                  id="prejoin-toggle-camera"
                  onClick={toggleCamera}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border font-bold text-sm transition-all duration-300 ${
                    isCameraOff
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-lg">{isCameraOff ? '📷' : '📹'}</span>
                  <span className="flex-1 text-left">{isCameraOff ? 'Camera Off' : 'Camera On'}</span>
                  <div className={`w-9 h-5 rounded-full relative transition-all duration-300 ${isCameraOff ? 'bg-red-500/30' : 'bg-emerald-500/50'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${isCameraOff ? 'left-0.5 bg-red-400' : 'left-4 bg-emerald-400'}`} />
                  </div>
                </button>

                {/* Mic toggle */}
                <button
                  id="prejoin-toggle-mic"
                  onClick={toggleMic}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border font-bold text-sm transition-all duration-300 ${
                    isMuted
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white hover:bg-white/[0.08]'
                  }`}
                >
                  <span className="text-lg">{isMuted ? '🔇' : '🎤'}</span>
                  <span className="flex-1 text-left">{isMuted ? 'Microphone Off' : 'Microphone On'}</span>
                  <div className={`w-9 h-5 rounded-full relative transition-all duration-300 ${isMuted ? 'bg-red-500/30' : 'bg-emerald-500/50'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all duration-300 ${isMuted ? 'left-0.5 bg-red-400' : 'left-4 bg-emerald-400'}`} />
                  </div>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Bottom — Join / Cancel */}
            <div className="space-y-3 pt-2">
              <button
                id="prejoin-join-btn"
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining...
                  </>
                ) : (
                  <>🚀 Join Meeting</>
                )}
              </button>

              <button
                id="prejoin-cancel-btn"
                onClick={handleCancel}
                className="w-full py-3.5 bg-transparent hover:bg-white/[0.04] text-slate-500 hover:text-slate-300 font-bold text-sm rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs font-medium mt-6">
          Your camera and microphone settings will be applied when you join
        </p>
      </div>
    </div>
  );
};

export default PreJoinPage;
