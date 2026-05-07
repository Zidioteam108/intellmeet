import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { 
  Video, 
  CheckSquare, 
  Users, 
  BrainCircuit, 
  ArrowUpRight, 
  PlayCircle, 
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react'

const DashboardPage = () => {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Meetings Today', value: '3', icon: Video, color: 'indigo', trend: '+12%' },
    { label: 'Pending Tasks', value: '12', icon: CheckSquare, color: 'purple', trend: '-2' },
    { label: 'Team Activity', value: 'High', icon: Users, color: 'cyan', trend: 'Stable' },
    { label: 'AI Summaries', value: '28', icon: BrainCircuit, color: 'blue', trend: '+5' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3 border border-indigo-100">
            <Sparkles className="w-3 h-3" />
            AI Assistant Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome back, {user?.name?.split(' ')[0]} <span className="inline-block animate-bounce">👋</span>
          </h1>
          <p className="text-slate-500 font-bold">Your AI intelligence engine is optimized and ready.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Platform Status: Optimal</p>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm ring-1 ring-slate-200/50">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass-card group p-6 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {stat.trend}
                </div>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{stat.value}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Next Meeting Card - Premium Overhaul */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 group border border-slate-800">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 bg-indigo-500/20 backdrop-blur-md rounded-full border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">
                  Up Next • 15:00
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  Live Soon
                </div>
              </div>
              <button className="p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-white transition-standard">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-4xl font-black text-white mb-6 leading-tight tracking-tight group-hover:translate-x-1 transition-transform duration-500">
              Strategy & Growth Planning <br /> 
              <span className="text-indigo-400">for Q3 Marketing Sprint</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mt-auto">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 text-indigo-100 font-bold">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-sm">45 minutes</span>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-4 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform cursor-pointer">
                      <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-4 border-slate-900 bg-indigo-600 text-white text-[10px] sm:text-xs font-black flex items-center justify-center">
                    +8
                  </div>
                </div>
              </div>
              <button className="w-full sm:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white text-slate-900 rounded-2xl font-black shadow-xl hover:scale-105 transition-standard flex items-center justify-center gap-3">
                <PlayCircle className="w-6 h-6 text-indigo-600" />
                JOIN MEETING
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights & Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full border-slate-200/50">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Workspace</h3>
            </div>
            
            <div className="space-y-4 flex-1">
              {[
                { label: 'Generate Summary', icon: BrainCircuit, color: 'indigo', path: '/analytics' },
                { label: 'Extract Tasks', icon: CheckSquare, color: 'purple', path: '/tasks' },
                { label: 'Team Analytics', icon: Users, color: 'cyan', path: '/analytics' },
              ].map((action, i) => (
                <Link 
                  key={i} 
                  to={action.path}
                  className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white border border-slate-100 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] text-center relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <p className="relative z-10 text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Upgrade Pro</p>
              <p className="relative z-10 text-sm font-bold text-white mb-5 leading-relaxed px-2">Unlock unlimited AI analysis & enterprise features.</p>
              <button className="relative z-10 w-full py-3.5 bg-white text-indigo-600 rounded-xl text-xs font-black hover:scale-105 transition-standard shadow-xl">
                GO PREMIUM
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Section Placeholder - Enhanced */}
      <div className="glass-card rounded-[3rem] p-10 shadow-sm border-slate-200/50">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Insights Feed</h3>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-2">Latest updates from your meetings</p>
          </div>
          <button className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 transition-standard uppercase tracking-widest">
            View Analytics
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8 animate-float">
            <BrainCircuit className="w-10 h-10 text-indigo-400 opacity-60" />
          </div>
          <h4 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Awaiting Meeting Data</h4>
          <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
            Your first intelligent summary is just one meeting away. Start or schedule a session to begin.
          </p>
          <button className="mt-10 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-200 hover:scale-105 transition-standard flex items-center gap-3">
            <Video className="w-5 h-5" />
            START NEW MEETING
          </button>
        </div>
      </div>

    </div>
  )
}

export default DashboardPage