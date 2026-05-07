import { Link, useLocation } from 'react-router-dom'
import logo from '@/assets/logo.png'
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Settings, 
  Mic, 
  History,
  Users,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Video, label: 'Meetings', path: '/meetings' },
    { icon: Mic, label: 'Recordings', path: '/recordings' },
    { icon: Calendar, label: 'Schedule', path: '/schedule' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: History, label: 'History', path: '/history' },
  ]

  const bottomItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shrink-0 shadow-sm z-20">
      {/* Brand */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={logo} alt="Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-6 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group",
              location.pathname === item.path
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-colors",
              location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-gray-900"
            )} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="p-6 border-t border-gray-50 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3 mb-4">System</p>
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 group",
              location.pathname === item.path && "bg-blue-600 text-white shadow-lg shadow-blue-200"
            )}
          >
            <item.icon className={cn(
              "h-5 w-5 transition-colors",
              location.pathname === item.path ? "text-white" : "text-gray-400 group-hover:text-gray-900"
            )} />
            {item.label}
          </Link>
        ))}
        
        <button className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-300 mt-4 group">
          <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
