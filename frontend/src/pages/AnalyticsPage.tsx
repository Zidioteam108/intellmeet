import { BarChart3, TrendingUp, Users, Clock, BrainCircuit, Activity, Calendar, ArrowUpRight, Zap, Target } from 'lucide-react'

const AnalyticsPage = () => {
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
          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-standard shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Last 30 Days
          </button>
          <button className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 transition-standard active:scale-95">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Meeting Time', value: '24h 15m', icon: Clock, color: 'indigo', trend: '+12%' },
          { label: 'Active Participants', value: '42', icon: Users, color: 'purple', trend: '+5%' },
          { label: 'AI Summaries Generated', value: '18', icon: BrainCircuit, color: 'blue', trend: '+28%' },
          { label: 'Tasks Extracted', value: '156', icon: Target, color: 'cyan', trend: '+15%' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-card group p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-green-50 text-green-600">
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Productivity Chart Area (Mock) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Meeting Engagement Over Time</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Activity Score</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          {/* Mock Chart Visualization */}
          <div className="mt-10 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="h-64 flex items-end gap-3 sm:gap-4 justify-between min-w-[500px] sm:min-w-full">
              {[40, 60, 35, 80, 50, 90, 70, 85, 45, 65, 55, 95].map((height, i) => (
                <div key={i} className="relative flex-1 flex flex-col justify-end group">
                  <div 
                    className="w-full bg-slate-100 rounded-t-xl group-hover:bg-indigo-100 transition-colors relative overflow-hidden" 
                    style={{ height: '100%' }}
                  >
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-400 uppercase">
                    W{i+1}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-8"></div> {/* Spacer for labels */}
        </div>

        {/* AI Sentiment Analysis */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col border border-slate-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                <Activity className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Sentiment Profile</h3>
            </div>

            <div className="space-y-8 relative z-10 flex-1">
              {[
                { label: 'Positive / Constructive', value: 78, color: 'bg-green-400' },
                { label: 'Neutral / Informative', value: 18, color: 'bg-indigo-400' },
                { label: 'Critical / Urgent', value: 4, color: 'bg-red-400' },
              ].map((sentiment, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">
                    <span>{sentiment.label}</span>
                    <span>{sentiment.value}%</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${sentiment.color} rounded-full`} 
                      style={{ width: `${sentiment.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-5 bg-white/5 border border-white/10 rounded-2xl relative z-10 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  <strong className="text-white">AI Insight:</strong> Your team's sentiment has improved by 12% following the switch to structured agendas.
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
