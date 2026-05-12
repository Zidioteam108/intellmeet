import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMeetings, createMeeting } from '../api/meetingsApi';
import { Video, Calendar, Sparkles, PlusCircle, LayoutGrid, Clock, ArrowRight, Activity, Users } from 'lucide-react';

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
    <div className="w-full lg:max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header section with blur orbs */}
      <div className="relative">
        <div className="absolute top-0 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute -top-10 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -z-10"></div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
              <Video className="w-3.5 h-3.5" />
              Conferencing Hub
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Meetings</h1>
            <p className="text-slate-500 font-medium mt-2 text-lg">Schedule, manage, and join your enterprise meetings.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-slate-400" />
              Grid View
            </button>
            <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
              <Calendar className="w-5 h-5" />
            </button>
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
        
        {/* Create Meeting Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[50px] -mr-10 -mt-10"></div>
            
            <h2 className="font-extrabold text-slate-900 text-xl mb-8 flex items-center gap-3 relative z-10">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              New Meeting
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-6 relative z-10 flex flex-col h-[calc(100%-6rem)]">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Roadmap Review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Context / Agenda</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the objective..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-auto"
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

        {/* Meetings List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="font-extrabold text-slate-900 text-xl">Upcoming & Recent</h2>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total: {meetings.length}</div>
          </div>
          
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300 h-64">
               <Activity className="w-8 h-8 text-indigo-400 animate-pulse mb-4" />
               <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Retrieving sessions...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center bg-white/50 rounded-[2.5rem] border border-dashed border-slate-300 h-64">
               <Calendar className="w-10 h-10 text-slate-300 mb-4" />
               <p className="text-slate-500 font-bold text-sm">No active meetings found in your workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2 pb-10">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="group bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-100">
                  <div className="mb-6 sm:mb-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                        meeting.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {meeting.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors tracking-tight">
                      {meeting.title}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                         <span>ID:</span>
                         <span className="text-slate-700">{meeting.roomId}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Host: <span className="text-indigo-600">{meeting.host?.name || 'You'}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex w-full sm:w-auto gap-3 items-center justify-between sm:justify-end mt-2 sm:mt-0">
                    <button 
                      onClick={() => navigate(`/meeting/${meeting._id}/summary`)}
                      className="flex-1 sm:flex-none bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-bold px-5 py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-100 hover:border-indigo-100"
                    >
                      Insights
                    </button>
                    <button 
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;