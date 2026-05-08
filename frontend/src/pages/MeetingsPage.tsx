import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { 
  Video, 
  Plus, 
  Link as LinkIcon, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Users, 
  Shield,
  Sparkles
} from 'lucide-react'

const sampleMeetings = [
  {
    id: '1',
    title: 'Daily Engineering Standup',
    roomId: 'abc-123-xyz',
    status: 'active',
    type: 'Team Sync',
    participants: 12,
    scheduledFor: 'Started 10 mins ago',
  },
  {
    id: '2',
    title: 'Client Strategy Review',
    roomId: 'review-456-pro',
    status: 'scheduled',
    type: 'Strategy',
    participants: 4,
    scheduledFor: 'Today, 4:30 PM',
  },
]

const MeetingsPage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState('')

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Create meeting API will connect on Day 8/9')
  }

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Join room ${roomId} flow will connect on Day 10`)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-8 px-4 sm:px-0 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-3 shadow-sm border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            Live Collaboration
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Meeting Lobby</h1>
          <p className="text-slate-500 mt-2 font-medium max-w-lg">
            Create instant rooms or join ongoing discussions with HD video and AI-powered intelligence.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                className="inline-block h-10 w-10 rounded-full ring-4 ring-white"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                alt="User"
              />
            ))}
          </div>
          <div className="pr-4 border-l border-slate-100 pl-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Online Now</p>
            <p className="text-sm font-bold text-slate-900">42 Members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Meeting Card */}
        <Card className="lg:col-span-2 glass-card border-white/50 shadow-2xl shadow-indigo-100/20 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
              <Plus className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Create New Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMeeting} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="meeting-title" className="text-slate-700 font-bold ml-1">Meeting Title</Label>
                  <Input
                    id="meeting-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Product Brainstorm"
                    className="py-6 bg-white/50 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting-type" className="text-slate-700 font-bold ml-1">Meeting Type</Label>
                  <select className="w-full h-[52px] bg-white/50 border border-slate-200 rounded-xl px-4 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all">
                    <option>General Discussion</option>
                    <option>Weekly Standup</option>
                    <option>Client Meeting</option>
                    <option>Technical Interview</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-description" className="text-slate-700 font-bold ml-1">Description (Optional)</Label>
                <textarea
                  id="meeting-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this meeting about?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              <Button type="submit" className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                <Video className="w-5 h-5 mr-2" />
                Start Instant Meeting
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Join Meeting Card */}
        <Card className="glass-card border-white/50 shadow-2xl shadow-purple-100/20 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full -ml-12 -mb-12 blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-200">
              <LinkIcon className="w-5 h-5" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Join Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinMeeting} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="room-id" className="text-slate-700 font-bold ml-1">Room ID or Link</Label>
                <Input
                  id="room-id"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Paste room ID (e.g. abc-123)"
                  className="py-6 bg-white/50 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-medium"
                />
              </div>
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold leading-relaxed">
                <Shield className="w-4 h-4 inline mr-2" />
                Ensure you have the correct permissions before joining private rooms.
              </div>
              <Button type="submit" variant="outline" className="w-full py-7 border-2 border-purple-200 hover:bg-purple-50 text-purple-700 rounded-xl font-black text-lg transition-all active:scale-[0.98]">
                Join Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meetings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Upcoming & Recent
          </h2>
          <button className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
            View History
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sampleMeetings.map((meeting) => (
            <motion.div
              key={meeting.id}
              variants={itemVariants}
              whileHover={{ scale: 1.005, x: 5 }}
              className="group glass-card border-white/60 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-indigo-100/40 transition-all border border-slate-100"
            >
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
                  meeting.status === 'active' 
                    ? 'bg-green-50 text-green-600 border border-green-100' 
                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  <Video className="w-7 h-7" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {meeting.type}
                    </span>
                    {meeting.status === 'active' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-50 text-[10px] font-black uppercase tracking-wider text-green-600 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        Live Now
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{meeting.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {meeting.scheduledFor}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Users className="w-3.5 h-3.5" />
                      {meeting.participants} Participants
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <LinkIcon className="w-3.5 h-3.5" />
                      {meeting.roomId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  size="lg" 
                  className={`px-8 py-6 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
                    meeting.status === 'active'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  {meeting.status === 'active' ? 'Rejoin Meeting' : 'Start Meeting'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default MeetingsPage