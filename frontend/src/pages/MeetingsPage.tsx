import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const sampleMeetings = [
  {
    id: '1',
    title: 'Daily Standup',
    roomId: 'abc123xyz',
    status: 'scheduled',
    scheduledFor: 'Today, 4:00 PM',
  },
  {
    id: '2',
    title: 'Client Review',
    roomId: 'review456',
    status: 'active',
    scheduledFor: 'Today, 6:30 PM',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
        <p className="text-gray-500 mt-1">Create, join, and manage your meetings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input
                  id="meeting-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Standup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting-description">Description</Label>
                <textarea
                  id="meeting-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short meeting description"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" className="w-full">Create Meeting</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join Existing Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room-id">Room ID</Label>
                <Input
                  id="room-id"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Paste room ID here"
                />
              </div>
              <Button type="submit" variant="outline" className="w-full">Join Meeting</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                  <p className="text-sm text-gray-500">Room ID: {meeting.roomId}</p>
                  <p className="text-sm text-gray-500">Scheduled: {meeting.scheduledFor}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      meeting.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {meeting.status}
                  </span>
                  <Button size="sm">Start Meeting</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MeetingsPage