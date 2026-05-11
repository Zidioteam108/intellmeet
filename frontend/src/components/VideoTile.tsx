import { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream | null;
  label: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

const VideoTile = ({ stream, label, isMuted = false, isCameraOff = false }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative group bg-slate-900 rounded-3xl overflow-hidden aspect-video shadow-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-indigo-500/20">
      {isCameraOff || !stream ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
          <div className="w-24 h-24 rounded-full bg-slate-800/80 backdrop-blur-xl flex items-center justify-center text-4xl text-white shadow-[inset_0_2px_20px_rgba(255,255,255,0.05)] border border-white/5 group-hover:scale-105 transition-transform duration-500">
            👤
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />
      )}

      {/* Name label at bottom */}
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-xl text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
        {label}
      </div>

      {/* Mute indicator */}
      {isMuted && (
        <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-2 border border-red-400/30">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
          MUTED
        </div>
      )}
    </div>
  );
};

export default VideoTile;
