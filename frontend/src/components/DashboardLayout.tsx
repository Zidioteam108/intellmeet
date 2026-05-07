import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { 
  LayoutDashboard, 
  Video, 
  CheckSquare, 
  BarChart3, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  Bell, 
  Search,
  Plus,
  Zap
} from 'lucide-react'
import logo from '@/assets/logo.png'

const navItems = [
  { label: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Meetings',   path: '/meetings',   icon: Video },
  { label: 'Tasks',      path: '/tasks',      icon: CheckSquare },
  { label: 'Analytics',  path: '/analytics',  icon: BarChart3 },
  { label: 'Profile',    path: '/profile',    icon: UserIcon },
]

interface Props {
  children: React.ReactNode
}

const DashboardLayout = ({ children }: Props) => {
  const { user, clearAuth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[140px] -z-10 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-[120px] -z-10 opacity-50"></div>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col transition-all duration-500 ease-in-out z-30 shadow-2xl shadow-indigo-500/5`}
      >
        {/* Logo Area */}
        <div className="h-24 flex items-center px-8 mb-4">
          {sidebarOpen ? (
            <Link to="/" className="flex items-center">
              <img src={logo} alt="IntellMeet" className="h-12 w-auto object-contain hover:scale-105 transition-standard" />
            </Link>
          ) : (
            <Link to="/" className="mx-auto">
              <img src={logo} alt="IntellMeet" className="h-8 w-auto object-contain hover:scale-110 transition-standard" />
            </Link>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {sidebarOpen && (
            <p className="px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all duration-300 relative
                  ${isActive
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 translate-x-1'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`} />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-lg" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-100">
          <div className={`p-4 mb-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all ${sidebarOpen ? 'opacity-100' : 'opacity-0 h-0 p-0 overflow-hidden'}`}>
             <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Status</span>
             </div>
             <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-indigo-500 rounded-full"></div>
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-sm font-black text-red-500 hover:bg-red-50 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 transition-colors" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className={`h-24 flex items-center justify-between px-10 z-20 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}>
          <div className="flex items-center gap-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all duration-300 shadow-sm"
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="hidden md:flex items-center gap-4 bg-white border border-slate-200 px-6 py-3 rounded-[1.25rem] w-96 shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search intelligence, meetings, tasks..." 
                className="bg-transparent border-none text-sm font-medium focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <button className="hidden sm:flex items-center gap-3 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 transition-all duration-300 group">
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              NEW MEETING
            </button>

            <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            {/* User Profile */}
            <Link to="/profile" className="flex items-center gap-4 p-2 pr-5 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-[1rem] object-cover ring-2 ring-white shadow-xl transition-all duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-[1rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl ring-2 ring-white group-hover:scale-110 transition-transform duration-500">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg"></div>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-black text-slate-900 leading-tight">{user?.name}</p>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Enterprise Pro</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
