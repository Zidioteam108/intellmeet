import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (token: string): Socket => {
  if (socket) {
    if (socket.connected && socket.auth && (socket.auth as any).token === token) {
      return socket;
    }
    socket.disconnect();
  }

  // VITE_API_URL typically ends with /api (e.g. https://backend.com/api)
  // Socket.io needs the base URL, so we strip /api from the end.
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected')
  })

  return socket
}

export const getSocket = (): Socket | null => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
