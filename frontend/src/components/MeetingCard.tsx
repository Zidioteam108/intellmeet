import React from 'react'
import { Video, Clock, Users, MoreVertical } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface MeetingCardProps {
  title: string
  time: string
  duration: string
  participants: number
  type: 'Instant' | 'Scheduled'
}

const MeetingCard: React.FC<MeetingCardProps> = ({ title, time, duration, participants, type }) => {
  return (
    <Card className="hover:shadow-md transition-shadow border-gray-100 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{type} Meeting</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{time}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">{participants} joined</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">{duration}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-8">View Details</Button>
            <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700">Join Now</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MeetingCard
