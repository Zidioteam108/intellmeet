import { useEffect, useState } from 'react';
import { getAllMeetings } from '../api/meetingsApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Clock, BrainCircuit, Activity, Calendar, ArrowUpRight, Zap, Target } from 'lucide-react'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const AnalyticsPage = () => {
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    getAllMeetings().then((data) => setMeetings(data.meetings || []));
  }, []);

  // Group meetings by status for pie chart
  const statusCount = meetings.reduce((acc: any, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCount).map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Group meetings by date for bar chart
  const dateCount = meetings.reduce((acc: any, m) => {
    const date = new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(dateCount).slice(-7).map(([date, count]) => ({ date, count }));

  return (
    <div className="w-full lg:max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
            <BarChart3 className="w-3.5 h-3.5" />
            Workspace Analytics
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">Deep insights into your team's collaboration and productivity.</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Last 30 Days
          </button>
          <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Meetings', value: meetings.length, icon: Clock, color: 'indigo', trend: '+12%' },
          { label: 'Active Now', value: meetings.filter((m) => m.status === 'active').length, icon: Activity, color: 'emerald', trend: 'Live' },
          { label: 'Ended Meetings', value: meetings.filter((m) => m.status === 'ended').length, icon: BrainCircuit, color: 'blue', trend: '+28%' },
          { label: 'Scheduled', value: meetings.filter((m) => m.status === 'scheduled').length, icon: Target, color: 'amber', trend: 'Upcoming' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${stat.trend === 'Live' ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Productivity Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Meetings Per Day (Last 7 Days)</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Volume Metric</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <div className="mt-10 h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#e0e7ff' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium">No meeting data available yet.</div>
            )}
          </div>
        </div>

        {/* AI Sentiment Analysis / Meeting Status Breakdown */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col border border-slate-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <Activity className="w-5 h-5 text-indigo-300" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Meeting Status Breakdown</h3>
            </div>

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
              {pieData.length > 0 ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic">Not enough data to map.</p>
              )}
              
              {/* Legend manually */}
              <div className="w-full mt-6 space-y-3">
                {pieData.map((entry, idx) => (
                   <div key={idx} className="flex justify-between text-xs font-bold text-slate-300 uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                       <span>{entry.name}</span>
                     </div>
                     <span>{String(entry.value)}</span>
                   </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-5 bg-white/5 border border-white/10 rounded-2xl relative z-10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  <strong className="text-white">Analytics Engine:</strong> Your platform is live and processing engagement metrics in real-time.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  )
}

export default AnalyticsPage
