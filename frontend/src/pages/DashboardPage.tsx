import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'

const DashboardPage = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening today</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Meetings Today', value: '0', color: 'blue' },
          { label: 'Pending Tasks', value: '0', color: 'orange' },
          { label: 'Team Members', value: '4', color: 'green' },
          { label: 'AI Summaries', value: '0', color: 'purple' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/meetings">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              🎥 Start Meeting
            </button>
          </Link>
          <Link to="/tasks">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              ✅ View Tasks
            </button>
          </Link>
          <Link to="/profile">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
              👤 Edit Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage