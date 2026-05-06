import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/StatCard'
import MeetingCard from '../components/MeetingCard'
import { 
  Plus, 
  Video, 
  Users, 
  Clock, 
  Calendar,
  ArrowUpRight,
  Monitor
} from 'lucide-react'
import { Button } from '../components/ui/button'

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-sm">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, John! 👋</h1>
              <p className="text-gray-500 mt-2 text-lg">You have <span className="text-blue-600 font-semibold">3 meetings</span> scheduled for today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 px-6 shadow-md shadow-blue-200">
                <Plus className="h-4 w-4" />
                New Meeting
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Meetings" 
            value="24" 
            icon={Video} 
            trend="+12%" 
            trendUp={true}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard 
            label="Active Participants" 
            value="156" 
            icon={Users} 
            trend="+5%" 
            trendUp={true}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard 
            label="Meeting Hours" 
            value="38.5h" 
            icon={Clock} 
            trend="-2%" 
            trendUp={false}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard 
            label="Resources Saved" 
            value="1.2TB" 
            icon={Monitor} 
            trend="+8%" 
            trendUp={true}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Meetings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Meetings</h2>
              <Button variant="link" className="text-blue-600 text-sm gap-1 p-0 h-auto">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MeetingCard 
                title="Weekly Design Sync" 
                time="Today, 10:00 AM" 
                duration="45 min" 
                participants={8} 
                type="Scheduled"
              />
              <MeetingCard 
                title="Product Roadmap" 
                time="Yesterday, 2:30 PM" 
                duration="1h 15m" 
                participants={12} 
                type="Scheduled"
              />
              <MeetingCard 
                title="Technical Interview" 
                time="Yesterday, 11:00 AM" 
                duration="50 min" 
                participants={3} 
                type="Instant"
              />
              <MeetingCard 
                title="Marketing Kickoff" 
                time="May 5, 4:00 PM" 
                duration="30 min" 
                participants={15} 
                type="Scheduled"
              />
            </div>
          </div>

          {/* Activity/Sidebar Info */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Today</h2>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 text-center w-12">
                      <p className="text-sm font-bold text-gray-900">1{i}:00</p>
                      <p className="text-xs text-gray-400">PM</p>
                    </div>
                    <div className="flex-1 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                      <h4 className="text-sm font-semibold text-gray-900">Sprint Planning Q3</h4>
                      <p className="text-xs text-gray-500 mt-1">4 Participants • Engineering Team</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none">
                View Full Calendar
              </Button>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                AI Meeting Summary
              </h3>
              <p className="text-blue-100 text-sm mt-3 leading-relaxed">
                Your last meeting had 3 key action items identified by IntellMeet AI. Click to review the auto-generated transcript.
              </p>
              <Button className="w-full mt-5 bg-white/10 hover:bg-white/20 text-white border-white/20">
                Read Summary
              </Button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage