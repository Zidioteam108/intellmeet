import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getAllMeetings, createMeeting } from '../api/meetingsApi';
import {
  Video,
  Calendar,
  Sparkles,
  PlusCircle,
  LayoutGrid,
  Clock,
  ArrowRight,
  Activity,
  Users,
  History,
  CheckCircle,
  XCircle,
  TimerOff,
  Timer,
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return '—';
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins === 0) return `${secs}s`;
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatDateTime(date: string | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  scheduled: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'  },
  ended:     { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'  },
  expired:   { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400'    },
  cancelled: { bg: 'bg-rose-50',    text: 'text-rose-600',    dot: 'bg-rose-400'   },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.ended;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ── Component ────────────────────────────────────────────────────────────────

const MeetingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Create form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [scheduledEndAt, setScheduledEndAt] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getAllMeetings();
        setMeetings(data.meetings);
      } catch {
        setError('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  // ── Split meetings by status ─────────────────────────────────────────────
  const activeMeetings = useMemo(
    () => meetings.filter((m) => m.status === 'active' || m.status === 'scheduled'),
    [meetings]
  );
  const historyMeetings = useMemo(
    () => meetings.filter((m) => m.status === 'ended' || m.status === 'expired' || m.status === 'cancelled'),
    [meetings]
  );

  // ── Create Meeting ────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Meeting title is required');

    setIsCreating(true);
    setError('');

    try {
      const payload: any = { title, description };
      if (showSchedule && scheduledFor) payload.scheduledFor = new Date(scheduledFor).toISOString();
      if (showSchedule && scheduledEndAt) payload.scheduledEndAt = new Date(scheduledEndAt).toISOString();

      const data = await createMeeting(payload);
      setMeetings((prev) => [data.meeting, ...prev]);
      setTitle('');
      setDescription('');
      setScheduledFor('');
      setScheduledEndAt('');
      setShowSchedule(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Helper: is current user host? ────────────────────────────────────────
  const isUserHost = (meeting: any) =>
    meeting.host?._id === user?.id || meeting.host === user?.id;

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalActive  = activeMeetings.length;
  const totalHistory = historyMeetings.length;

  return (
    <div className="w-full lg:max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute top-0 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute -top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
              <Video className="w-3.5 h-3.5" />
              Conferencing Hub
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">My Meetings</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Schedule, manage, and review your enterprise meetings.</p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
              <p className="text-2xl font-black text-emerald-700">{totalActive}</p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-2xl font-black text-slate-700">{totalHistory}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">History</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl text-sm font-bold animate-pulse flex items-center gap-3">
          <Activity className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Create Meeting Form ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[50px] -mr-10 -mt-10" />

            <h2 className="font-extrabold text-slate-900 text-xl mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              New Meeting
            </h2>

            <form onSubmit={handleCreate} className="space-y-5 relative z-10">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title *</label>
                <input
                  id="meeting-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Roadmap Review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                />
              </div>

              {/* Agenda */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Context / Agenda</label>
                <textarea
                  id="meeting-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the objective..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* Schedule toggle */}
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:text-indigo-700 transition-colors"
              >
                <Timer className="w-4 h-4" />
                {showSchedule ? 'Remove Schedule' : '+ Set Meeting Time (Optional)'}
              </button>

              {/* Schedule fields */}
              {showSchedule && (
                <div className="space-y-4 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Start Time
                    </label>
                    <input
                      id="meeting-scheduled-for"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                    <p className="text-[10px] text-slate-400 ml-1">Participants cannot join before this time</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <TimerOff className="w-3 h-3" /> End Time <span className="text-slate-300">(auto-closes)</span>
                    </label>
                    <input
                      id="meeting-scheduled-end"
                      type="datetime-local"
                      value={scheduledEndAt}
                      onChange={(e) => setScheduledEndAt(e.target.value)}
                      min={scheduledFor || new Date().toISOString().slice(0, 16)}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                    <p className="text-[10px] text-slate-400 ml-1">Meeting auto-expires after this time</p>
                  </div>
                </div>
              )}

              <button
                id="create-meeting-btn"
                type="submit"
                disabled={isCreating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2"><Activity className="w-5 h-5 animate-spin" /> Initializing...</span>
                ) : (
                  <span className="flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Create Room</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Meetings List ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tab switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              id="tab-active"
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Active
              {totalActive > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalActive}</span>
              )}
            </button>
            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-4 h-4" />
              History
              {totalHistory > 0 && (
                <span className="bg-slate-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalHistory}</span>
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300 h-64">
              <Activity className="w-8 h-8 text-indigo-400 animate-pulse mb-4" />
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Retrieving sessions...</p>
            </div>
          ) : activeTab === 'active' ? (
            /* ── ACTIVE TAB ──────────────────────────────────────────────── */
            activeMeetings.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300 h-64">
                <Calendar className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold text-sm">No active meetings. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[640px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                {activeMeetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="group bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100"
                  >
                    <div className="mb-5 sm:mb-0 space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={meeting.status} />
                        {isUserHost(meeting) && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600">
                            You're Host
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(meeting.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors tracking-tight truncate">
                        {meeting.title}
                      </h3>

                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>ID:</span>
                          <span className="text-slate-700 font-mono">{meeting.roomId}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          Host: <span className="text-indigo-600">{meeting.host?.name || 'You'}</span>
                        </p>
                        {meeting.scheduledFor && (
                          <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            Starts: {formatDateTime(meeting.scheduledFor)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto gap-3 items-center justify-between sm:justify-end mt-2 sm:mt-0 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/meeting/${meeting._id}/summary`)}
                        className="flex-1 sm:flex-none bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-bold px-5 py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100 hover:border-indigo-100"
                      >
                        Insights
                      </button>
                      <button
                        id={`enter-room-${meeting.roomId}`}
                        onClick={() => navigate(`/room/${meeting.roomId}`)}
                        className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Enter Room
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ── HISTORY TAB ─────────────────────────────────────────────── */
            historyMeetings.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300 h-64">
                <History className="w-10 h-10 text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold text-sm">No past meetings yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[640px] overflow-y-auto custom-scrollbar pr-2 pb-4">
                {historyMeetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="group bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:shadow-md"
                  >
                    <div className="mb-4 sm:mb-0 space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={meeting.status} />
                        {isUserHost(meeting) && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 text-slate-500">
                            Hosted by You
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-700 text-lg tracking-tight truncate">
                        {meeting.title}
                      </h3>

                      {/* Metadata row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <CheckCircle className="w-3 h-3 text-slate-400" />
                          Started: <span className="text-slate-700">{formatDateTime(meeting.startedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <XCircle className="w-3 h-3 text-red-400" />
                          Ended: <span className="text-slate-700">{formatDateTime(meeting.endedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Timer className="w-3 h-3 text-indigo-400" />
                          Duration: <span className="text-indigo-600 font-black">{formatDuration(meeting.startedAt, meeting.endedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Users className="w-3 h-3 text-slate-400" />
                          {meeting.participants?.length ?? 0} participant{meeting.participants?.length !== 1 ? 's' : ''}
                        </div>
                        {meeting.endedBy?.name && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            Ended by: <span className="text-rose-600">{meeting.endedBy.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View insights only — no "Enter Room" for past meetings */}
                    <div className="flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
                      <button
                        id={`insights-${meeting._id}`}
                        onClick={() => navigate(`/meeting/${meeting._id}/summary`)}
                        className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-bold px-5 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-2 border border-slate-100 hover:border-indigo-100 whitespace-nowrap"
                      >
                        <Sparkles className="w-4 h-4" />
                        View Insights
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;