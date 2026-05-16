import { io, Socket } from 'socket.io-client'
import axios from 'axios'

let socket: Socket | null = null

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
// Socket.io needs the base URL without /api suffix
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

// ── Token refresh helper ───────────────────────────────────────────────────
// Calls the /auth/refresh endpoint (uses the httpOnly refresh token cookie).
// Returns the new access token string, or null if refresh fails.
const attemptTokenRefresh = async (): Promise<string | null> => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    )
    const newToken: string = res.data.accessToken
    if (newToken) {
      localStorage.setItem('intellmeet_token', newToken)
      return newToken
    }
    return null
  } catch {
    return null
  }
}

// ── Connect (or reconnect) socket with a given token ──────────────────────
export const connectSocket = (token: string): Socket => {
  // Reuse existing connected socket if it already uses the same token
  if (socket && socket.connected && (socket.auth as any)?.token === token) {
    return socket
  }

  // Disconnect stale socket before creating a new one
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
    // Don't auto-reconnect on auth errors — we handle reconnect manually below
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  // ── Successful connection ────────────────────────────────────────────────
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id)
  })

  // ── Connection error — may be auth failure (expired token) ───────────────
  socket.on('connect_error', async (err: Error) => {
    const msg = err.message?.toLowerCase() ?? ''
    const isAuthError =
      msg.includes('expired') ||
      msg.includes('invalid token') ||
      msg.includes('authentication') ||
      msg.includes('jwt')

    if (isAuthError) {
      console.warn('🔑 Socket auth error — attempting token refresh:', err.message)

      const newToken = await attemptTokenRefresh()

      if (newToken) {
        console.log('✅ Token refreshed — reconnecting socket')
        // Update the auth token and force reconnect
        if (socket) {
          ;(socket.auth as any).token = newToken
          socket.connect()
        }
      } else {
        // Refresh failed — user must log in again
        console.error('❌ Token refresh failed — redirecting to login')
        socket?.disconnect()
        socket = null
        localStorage.removeItem('intellmeet_token')
        window.location.href = '/login'
      }
    } else {
      console.error('Socket connection error:', err.message)
    }
  })

  // ── Disconnection event ──────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
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
