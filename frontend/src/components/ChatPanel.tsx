import { useEffect, useRef, useState } from 'react'
import { Socket } from 'socket.io-client'

interface Message {
  id: string
  senderName: string
  message: string
  time: string
  isMine: boolean
  senderId?: string
}

interface Props {
  socket: Socket | null
  roomId: string
  currentUserId: string
  currentUserName: string
  onClose?: () => void
}

const ChatPanel = ({ socket, roomId, currentUserId, currentUserName, onClose }: Props) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

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

    const messageData = {
      roomId,
      message: inputText.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      id: Date.now().toString(),
      time: new Date().toISOString(),
    }

    // Emit to server
    socket.emit('chat-message', messageData)
    
    // Clear input
    setInputText('')
  }

  return (
    <div className="flex flex-col h-full bg-[#121215]/80 sm:bg-transparent backdrop-blur-2xl">
      <div className="px-4 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Meeting Chat
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="sm:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-10 space-y-3">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-xl">
              👋
            </div>
            <p className="text-xs text-slate-400 font-medium">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
            {!msg.isMine && (
              <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1">{msg.senderName}</span>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 text-sm shadow-xl ${
              msg.isMine
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-blue-900/20'
                : 'bg-white/10 text-slate-200 rounded-2xl rounded-tl-sm border border-white/5'
            }`}>
              {msg.message}
            </div>
            <span className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-white/5 p-4 bg-white/5 flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm px-4 py-3 bg-[#0a0a0c] text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500 shadow-inner"
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()}
          className="px-5 py-3 bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
