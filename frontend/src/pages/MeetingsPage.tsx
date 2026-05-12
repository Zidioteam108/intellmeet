import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMeetings, createMeeting } from '../api/meetingsApi';

const MeetingsPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Fetch meetings on page load
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getAllMeetings();
        setMeetings(data.meetings);
      } catch (err) {
        setError('Failed to load meetings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('Meeting title is required');

    setIsCreating(true);
    setError('');

    try {
      const data = await createMeeting({ title, description });
      setMeetings((prev) => [data.meeting, ...prev]);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meetings</h1>
        <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 px-6 py-4 rounded-2xl text-sm font-bold animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {/* Create Meeting Form */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-5 sm:p-8 shadow-xl shadow-indigo-500/5">
        <h2 className="font-black text-slate-800 text-xl mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">✨</div>
          Create New Meeting
        </h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
             <input
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Enter a descriptive title..."
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
             />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optional)</label>
             <textarea
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="What is this meeting about?"
               className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
               rows={3}
             />
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isCreating ? '🚀 Launching...' : 'Start New Meeting'}
          </button>
        </form>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-800 text-xl px-2">Your Meetings</h2>
        {isLoading ? (
          <div className="p-12 text-center bg-white/50 rounded-[2rem] border border-dashed border-slate-300">
             <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Syncing with cloud...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-12 text-center bg-white/50 rounded-[2rem] border border-dashed border-slate-300">
             <p className="text-slate-400 font-bold text-sm">No meetings scheduled yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="group bg-white hover:bg-indigo-50/30 rounded-[2rem] border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1">
                <div className="mb-6 sm:mb-0 space-y-2">
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{meeting.title}</h3>
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                       <span className="text-[10px] font-black text-slate-500 uppercase">ID: {meeting.roomId}</span>
                    </div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                      HOST: {meeting.host?.name || 'You'}
                    </p>
                  </div>
                </div>
                <div className="flex w-full sm:w-auto gap-3 items-center justify-between sm:justify-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                    meeting.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {meeting.status}
                  </span>
                  <button 
                    onClick={() => navigate(`/meeting/${meeting._id}/summary`)}
                    className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest px-4 py-4 rounded-2xl transition-all active:scale-95"
                  >
                    View Summary
                  </button>
                  <button 
                    onClick={() => navigate(`/room/${meeting.roomId}`)}
                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;