import { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/utils/socket'

interface Message {
  id: string
  senderName: string
  message: string
  time: string
  isMine: boolean
  senderId?: string
}

interface Props {
  roomId: string
  currentUserId: string
  currentUserName: string
}

const ChatPanel = ({ roomId, currentUserId, currentUserName }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const socket = getSocket()

  useEffect(() => {
    if (!socket) return

    socket.on('chat-message', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          senderName: data.senderName,
          message: data.message,
          time: new Date(data.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: data.senderId === currentUserId,
        },
      ])
    })

    return () => {
      socket.off('chat-message')
    }
  }, [socket, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !socket) return

    socket.emit('chat-message', {
      roomId,
      message: inputText.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
    })
    setInputText('')
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">Meeting Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-4">No messages yet. Say hello! 👋</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
            {!msg.isMine && (
              <span className="text-xs text-gray-400 mb-1">{msg.senderName}</span>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
              msg.isMine
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.message}
            </div>
            <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
