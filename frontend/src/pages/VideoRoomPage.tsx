import ChatPanel from '@/components/ChatPanel'

const VideoRoomPage = () => {
  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">

      {/* Video Area */}
      <div className="flex-1 flex flex-col">

        {/* Meeting Header */}
        <div className="h-14 bg-gray-800 flex items-center justify-between px-6">
          <h2 className="text-white font-semibold">Daily Standup</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
              🎤 Mute
            </button>
            <button className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
              📷 Camera Off
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              Leave
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-700 rounded-xl flex items-center justify-center relative"
            >
              <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white">
                👤
              </div>
              <div className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded">
                {i === 1 ? 'You' : 'Participant 2'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="w-80 flex-shrink-0">
        <ChatPanel />
      </div>
    </div>
  )
}

export default VideoRoomPage
