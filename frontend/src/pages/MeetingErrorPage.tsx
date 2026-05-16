import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MeetingErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get('reason') || 'not-found';
  const meetingId = searchParams.get('meetingId');
  const scheduledFor = searchParams.get('scheduledFor');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const isEnded = reason === 'ended';
  const isNotStarted = reason === 'not-started';

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Animated background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: isEnded
              ? 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)'
              : isNotStarted
              ? 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-lg transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Top logo / brand */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-black text-xl">I</span>
            </div>
            <span className="text-white/80 font-black text-lg tracking-tight">IntellMeet</span>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-black/50">
          
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl ${
                isEnded
                  ? 'bg-red-500/10 border border-red-500/20 shadow-red-500/10'
                  : isNotStarted
                  ? 'bg-amber-500/10 border border-amber-500/20 shadow-amber-500/10'
                  : 'bg-indigo-500/10 border border-indigo-500/20 shadow-indigo-500/10'
              }`}
            >
              {isEnded ? (
                /* Lock / ended icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ) : isNotStarted ? (
                /* Clock / not started icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ) : (
                /* Broken link icon */
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="flex justify-center mb-5">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                isEnded
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : isNotStarted
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isEnded ? 'bg-red-400' : isNotStarted ? 'bg-amber-400' : 'bg-indigo-400'} animate-pulse`} />
              {isEnded ? 'Meeting Ended' : isNotStarted ? 'Meeting Not Started Yet' : 'Meeting Not Found'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-black text-white text-center mb-3 tracking-tight leading-tight">
            {isEnded
              ? 'This meeting has ended'
              : isNotStarted
              ? "Meeting hasn't started yet"
              : 'Meeting not found'}
          </h1>

          {/* Subtext */}
          <p className="text-slate-400 text-center text-sm sm:text-base font-medium leading-relaxed mb-8">
            {isEnded
              ? 'The host ended this meeting. You can view the meeting summary or start a new one.'
              : isNotStarted
              ? `This meeting is scheduled for a future time${scheduledFor ? ': ' + new Date(scheduledFor).toLocaleString() : ''}. Please return at the scheduled time.`
              : 'This meeting link is invalid or has been removed. Please check the link or ask the host to resend it.'}
          </p>

          {/* Divider */}
          <div className="h-px bg-white/5 mb-8" />

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {isEnded && meetingId && (
              <Link
                to={`/meeting/${meetingId}/summary`}
                id="view-summary-btn"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl text-center transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                📋 View Meeting Summary
              </Link>
            )}

            <button
              id="go-to-meetings-btn"
              onClick={() => navigate('/meetings')}
              className={`w-full py-4 font-black text-sm uppercase tracking-widest rounded-2xl text-center transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
                isEnded && meetingId
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              🗓️ Go to My Meetings
            </button>

            <button
              id="create-new-meeting-btn"
              onClick={() => navigate('/meetings')}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-black text-sm uppercase tracking-widest rounded-2xl text-center border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              ✨ Create New Meeting
            </button>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-slate-600 text-xs font-medium mt-6">
          Need help?{' '}
          <span className="text-slate-500">Contact the meeting host or your admin.</span>
        </p>
      </div>
    </div>
  );
};

export default MeetingErrorPage;
