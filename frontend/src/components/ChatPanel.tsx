import { useState } from 'react'

interface Message {
  id: string
  senderName: string
  text: string
  time: string
  isMine: boolean
}

const sampleMessages: Message[] = [
  { id: '1', senderName: 'Ravi', text: 'Hello everyone!', time: '10:01 AM', isMine: false },
  { id: '2', senderName: 'You', text: 'Hi Ravi, ready to start?', time: '10:02 AM', isMine: true },
  { id: '3', senderName: 'Priya', text: 'Yes, let\'s begin!', time: '10:03 AM', isMine: false },
]

const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [inputText, setInputText] = useState('')

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMsg: Message = {
      id: Date.now().toString(),
      senderName: 'You',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    }

    setMessages((prev) => [...prev, newMsg])
    setInputText('')
    // Socket emit will be added on Day 6
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">

      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">Meeting Chat</h3>
        <p className="text-xs text-gray-400">3 participants</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
          >
            {!msg.isMine && (
              <span className="text-xs text-gray-400 mb-1">{msg.senderName}</span>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.isMine
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-xs text-gray-400 mt-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
