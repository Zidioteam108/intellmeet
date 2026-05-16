const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
const ChatMessage = require('../models/ChatMessage');

// roomId → Set of { socketId, userId, userName }
const rooms = new Map();

// roomId → { hostUserId, hostSocketId }
const roomHosts = new Map();

// roomId → NodeJS.Timeout (auto-expire timer when room becomes empty)
const expireTimers = new Map();

// userId → socketId (for host reconnect grace period)
const hostGraceTimers = new Map();

const EMPTY_ROOM_EXPIRE_MS = 5 * 60 * 1000;  // 5 minutes
const HOST_GRACE_MS        = 45 * 1000;       // 45 seconds

// ── Helpers ────────────────────────────────────────────────────────────────

/** Remove a socket from in-memory room tracking */
const removeFromRoom = (socket, roomId) => {
  if (!rooms.has(roomId)) return;
  const set = rooms.get(roomId);
  for (const entry of set) {
    if (entry.socketId === socket.id) { set.delete(entry); break; }
  }
  if (set.size === 0) rooms.delete(roomId);
};

/** Schedule auto-expire of a room after EMPTY_ROOM_EXPIRE_MS */
const scheduleExpire = (io, roomId) => {
  // Cancel any existing timer first
  if (expireTimers.has(roomId)) {
    clearTimeout(expireTimers.get(roomId));
  }

  const timer = setTimeout(async () => {
    expireTimers.delete(roomId);
    try {
      const meeting = await Meeting.findOne({ roomId, status: 'active' });
      if (!meeting) return;

      // Check if the Socket.io room still has members
      const socketsInRoom = await io.in(roomId).allSockets();
      if (socketsInRoom.size > 0) return; // Someone rejoined

      meeting.status = 'expired';
      meeting.endedAt = new Date();
      await meeting.save();
      console.log(`⏰ Meeting ${roomId} auto-expired (empty room)`);
    } catch (err) {
      console.error('Auto-expire error:', err.message);
    }
  }, EMPTY_ROOM_EXPIRE_MS);

  expireTimers.set(roomId, timer);
};

/** Cancel auto-expire if someone joins */
const cancelExpire = (roomId) => {
  if (expireTimers.has(roomId)) {
    clearTimeout(expireTimers.get(roomId));
    expireTimers.delete(roomId);
  }
};

// ── Main Socket Handler ────────────────────────────────────────────────────

const socketHandler = (io) => {
  // ── Authentication Middleware ────────────────────────────────────────────
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

      socket.user = user;
      next();

    } catch (err) {
      // Use a specific, machine-readable message for expired tokens so the
      // frontend socket utility can catch it and auto-refresh the access token
      // without forcing the user to log out.
      if (err.name === 'TokenExpiredError') {
        console.warn(`⚠️  Socket JWT expired for connection attempt — client should refresh token`);
        return next(new Error('jwt expired'));
      }
      console.error('Socket Auth Error:', err.message);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} — User: ${socket.user?.name}`);

    // ── Join Personal Room (for Notifications) ──────────────────────────
    socket.on('join-personal', ({ userId }) => {
      socket.join(`user:${userId}`);
    });

    // ── Join Room ────────────────────────────────────────────────────────
    // ── Join Room ──────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId, userName, avatar, isCameraOff }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add({ socketId: socket.id, userId, userName });

      // Cancel any pending auto-expire for this room
      cancelExpire(roomId);

      // Cancel host grace timer if host is reconnecting
      if (hostGraceTimers.has(userId)) {
        clearTimeout(hostGraceTimers.get(userId));
        hostGraceTimers.delete(userId);
        console.log(`🔄 Host ${userName} reconnected — grace period cancelled`);
      }

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
      const roomSize = rooms.get(roomId)?.size ?? 1;
      socket.emit('room-info', { roomId, participants: roomSize });
    });


    socket.on('offer', ({ to, offer, userName, avatar, isCameraOff }) => {
      io.to(to).emit('offer', { from: socket.id, offer, userName, avatar, isCameraOff });
    });

    // ── WebRTC Answer ────────────────────────────────────────────────────
    socket.on('answer', ({ to, answer }) => {
      io.to(to).emit('answer', { from: socket.id, answer });
    });

    // ── ICE Candidate ────────────────────────────────────────────────────
    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    // ── Chat Message ─────────────────────────────────────────────────────
    socket.on('chat-message', async ({ roomId, message, senderName, senderId }) => {
      try {
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

    // ── Typing Indicator ─────────────────────────────────────────────────
    socket.on('typing-start', ({ roomId, userName }) => {
      socket.to(roomId).emit('typing-start', { userName, socketId: socket.id });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('typing-stop', { socketId: socket.id });
    });

    // ── Mute/Unmute Status ───────────────────────────────────────────────
    socket.on('toggle-audio', ({ roomId, isMuted }) => {
      socket.to(roomId).emit('user-audio-toggle', { socketId: socket.id, isMuted });
    });

    // ── Camera On/Off Status ───────────────────────────────────────────
    socket.on('toggle-camera', ({ roomId, isCameraOff }) => {
      socket.to(roomId).emit('user-camera-toggle', { socketId: socket.id, isCameraOff });
    });

    // ── End Meeting (Host Only) — PRODUCTION GRADE ───────────────────────
    // This is the CRITICAL fix: DB updated in socket handler, then io.to()
    // broadcasts to ALL sockets in the room (including the host socket itself).
    socket.on('end-meeting', async ({ roomId }) => {
      try {
        const meeting = await Meeting.findOne({ roomId });

        if (!meeting) {
          return socket.emit('error', { message: 'Meeting not found' });
        }

        // Verify the requester is the host
        if (meeting.host.toString() !== socket.user._id.toString()) {
          return socket.emit('error', { message: 'Only the host can end the meeting' });
        }

        // Already ended — no-op
        if (meeting.status === 'ended' || meeting.status === 'expired') {
          return;
        }

        // ── Step 1: Update DB ──────────────────────────────────────────
        meeting.status = 'ended';
        meeting.endedAt = new Date();
        meeting.endedBy = socket.user._id;
        meeting.allowRejoin = false;
        await meeting.save();

        console.log(`🛑 Meeting ${roomId} ended by host: ${socket.user.name}`);

        // ── Step 2: Broadcast to ALL in room (including host) ──────────
        // io.to() not socket.to() — this is the fix that ensures the host
        // also receives the event and cleans up their own connection.
        io.to(roomId).emit('meeting-ended', {
          meetingId: meeting._id.toString(),
          roomId,
          endedBy: socket.user.name,
          endedAt: meeting.endedAt,
        });

        // ── Step 3: Cancel any pending expire timer ────────────────────
        cancelExpire(roomId);

        // ── Step 4: Clear room from memory ────────────────────────────
        rooms.delete(roomId);
        roomHosts.delete(roomId);

      } catch (err) {
        console.error('end-meeting error:', err.message);
        socket.emit('error', { message: 'Failed to end meeting' });
      }
    });

    // ── Leave Room (explicit) ────────────────────────────────────────────
    socket.on('leave-room', ({ roomId }) => {
      console.log(`👋 ${socket.user?.name} left room: ${roomId}`);
      socket.leave(roomId);
      removeFromRoom(socket, roomId);

      socket.to(roomId).emit('user-left', { socketId: socket.id });

      // If room is now empty, schedule auto-expire
      const socketsInRoom = rooms.get(roomId);
      if (!socketsInRoom || socketsInRoom.size === 0) {
        scheduleExpire(io, roomId);
      }
    });

    // ── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnecting', () => {
      socket.rooms.forEach((roomId) => {
        if (roomId === socket.id) return; // skip personal room

        removeFromRoom(socket, roomId);
        socket.to(roomId).emit('user-left', { socketId: socket.id });

        // Check if this was the host disconnecting (accidental)
        const hostInfo = roomHosts.get(roomId);
        const userId = socket.user?._id?.toString();
        if (hostInfo && hostInfo.hostUserId === userId) {
          console.log(`⚠️ Host ${socket.user.name} disconnected from ${roomId} — grace period started`);
          // Start grace period — if host reconnects within 45s, restore; else no action
          // (We do NOT auto-end the meeting on accidental host disconnect)
          const graceTimer = setTimeout(() => {
            hostGraceTimers.delete(userId);
            console.log(`⏰ Host grace period expired for user ${userId} in room ${roomId}`);
          }, HOST_GRACE_MS);
          hostGraceTimers.set(userId, graceTimer);
        }

        // If room is now empty, schedule auto-expire
        const socketsInRoom = rooms.get(roomId);
        if (!socketsInRoom || socketsInRoom.size === 0) {
          scheduleExpire(io, roomId);
        }
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
