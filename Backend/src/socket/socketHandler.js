const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const rooms = new Map(); // roomId -> Set of socketIds

const socketHandler = (io) => {
  // ── Authentication Middleware ───────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket for use later
      socket.user = user;
      next();

    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} — User: ${socket.user?.name}`);

    // ── Join Personal Room (for Notifications) ─────────────────────────
    socket.on('join-personal', ({ userId }) => {
      socket.join(`user:${userId}`);
    });

    // ── Join Room ──────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId, userName, avatar, isCameraOff }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      console.log(`👤 ${userName} joined room: ${roomId}`);

      // Tell all others in room that a new user joined
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        avatar,
        isCameraOff,
      });

      // Tell the new user how many people are already in the room
      const roomSize = rooms.get(roomId).size;
      socket.emit('room-info', { roomId, participants: roomSize });
    });

    // ── WebRTC Offer ───────────────────────────────────────────────────
    socket.on('offer', ({ to, offer, userName, avatar, isCameraOff }) => {
      io.to(to).emit('offer', { from: socket.id, offer, userName, avatar, isCameraOff });
    });

    // ── WebRTC Answer ──────────────────────────────────────────────────
    socket.on('answer', ({ to, answer }) => {
      io.to(to).emit('answer', { from: socket.id, answer });
    });

    // ── ICE Candidate ──────────────────────────────────────────────────
    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    // ── Chat Message ───────────────────────────────────────────────────
    socket.on('chat-message', async ({ roomId, message, senderName, senderId }) => {
      try {
        // Save to database
        await ChatMessage.create({
          roomId,
          sender: senderId,
          message,
        });
      } catch (err) {
        console.error('Chat save error:', err.message);
      }

      io.to(roomId).emit('chat-message', {
        id: Date.now().toString(),
        message,
        senderName,
        senderId,
        socketId: socket.id,
        time: new Date().toISOString(),
      });
    });

    // ── Typing Indicator ───────────────────────────────────────────────
    socket.on('typing-start', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing-start', { userName, socketId: socket.id });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('typing-stop', { socketId: socket.id });
    });

    // ── Mute/Unmute Status ─────────────────────────────────────────────
    socket.on('toggle-audio', ({ roomId, isMuted }) => {
      socket.to(roomId).emit('user-audio-toggle', { socketId: socket.id, isMuted });
    });

    // ── Camera On/Off Status ───────────────────────────────────────────
    socket.on('toggle-camera', ({ roomId, isCameraOff }) => {
      socket.to(roomId).emit('user-camera-toggle', { socketId: socket.id, isCameraOff });
    });

    // ── End Meeting (Host Only) ─────────────────────────────────────────
    socket.on('end-meeting', ({ roomId }) => {
      console.log(`🛑 Meeting ended by host in room: ${roomId}`);
      socket.to(roomId).emit('meeting-ended', { endedBy: socket.user?.name });
    });

    // ── Disconnect ─────────────────────────────────────────────────────
    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomId) => {
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(socket.id);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          }
        }
        socket.to(roomId).emit('user-left', { socketId: socket.id });
      });
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

// Emit notification to a specific user
const sendNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

module.exports = { socketHandler, sendNotification };
