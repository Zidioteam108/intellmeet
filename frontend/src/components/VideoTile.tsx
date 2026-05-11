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
    <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-2xl border border-white/5">
      {isCameraOff || !stream ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-4xl text-white shadow-inner">
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
      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10">
        {label}
      </div>

      {/* Mute indicator */}
      {isMuted && label.includes('(You)') && (
        <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          LOCAL MUTE
        </div>
      )}
    </div>
  );
};

export default VideoTile;
