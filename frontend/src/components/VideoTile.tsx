import { useEffect, useRef, useState } from 'react';

interface Props {
  stream: MediaStream | null;
  label: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isScreenShare?: boolean;
  onPin?: () => void;
  isPinned?: boolean;
  avatar?: string;
}

const VideoTile = ({ stream, label, isMuted = false, isCameraOff = false, isScreenShare = false, onPin, isPinned = false, avatar }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Listen for fullscreen exit
  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden shadow-2xl border transition-all duration-500 ${
        isPinned
          ? 'col-span-full row-span-2 aspect-auto min-h-[400px] rounded-3xl border-indigo-500/50 ring-2 ring-indigo-500/20 shadow-indigo-500/20'
          : 'aspect-video rounded-3xl border-white/10 hover:border-indigo-500/50 hover:shadow-indigo-500/20'
      } ${isFullscreen ? 'bg-black' : 'bg-slate-900'}`}
    >
      {isCameraOff || !stream ? (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
          {/* Soft blurred background */}
          {avatar && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 blur-[60px] scale-125"
              style={{ backgroundImage: `url(${avatar})` }}
            />
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-white/20 shadow-2xl overflow-hidden bg-slate-800/80 backdrop-blur-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              {avatar ? (
                <img src={avatar} alt={label} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black">
                  {label.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {/* Minimal Name below avatar (if pinned, we can show it larger) */}
            <p className="mt-4 text-white/90 font-black text-[10px] sm:text-xs tracking-[0.2em] uppercase">
              {label}
            </p>
          </div>

          {/* Camera-off badge */}
          <div className="absolute top-4 right-4 bg-slate-900/60 backdrop-blur-xl px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Video Off</span>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
        />
      )}

      {/* Name label at bottom-left */}
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-lg flex items-center gap-2">
        {label}
        {isScreenShare && (
          <span className="bg-green-500/80 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest">SCREEN</span>
        )}
      </div>

      {/* Mute indicator */}
      {isMuted && (
        <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-red-400/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
          MUTED
        </div>
      )}

      {/* Action buttons — visible on hover */}
      <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="w-8 h-8 bg-black/50 backdrop-blur-xl text-white rounded-lg flex items-center justify-center hover:bg-black/70 transition-all border border-white/10 shadow-lg"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"/>
              <polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          )}
        </button>

        {/* Pin button (only if onPin provided) */}
        {onPin && (
          <button
            onClick={onPin}
            aria-label={isPinned ? 'Unpin video' : 'Pin video'}
            className={`w-8 h-8 backdrop-blur-xl text-white rounded-lg flex items-center justify-center transition-all border shadow-lg ${
              isPinned
                ? 'bg-indigo-600/70 border-indigo-400/30 hover:bg-indigo-700/70'
                : 'bg-black/50 border-white/10 hover:bg-black/70'
            }`}
            title={isPinned ? 'Unpin' : 'Pin to Large View'}
          >
            📌
          </button>
        )}
      </div>

      {/* Pinned indicator badge */}
      {isPinned && (
        <div className="absolute top-4 right-4 bg-indigo-600/80 backdrop-blur-xl text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-indigo-400/30 animate-in fade-in duration-300">
          📌 PINNED
        </div>
      )}
    </div>
  );
};

export default VideoTile;
