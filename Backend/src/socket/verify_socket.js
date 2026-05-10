const { io } = require('socket.io-client');

const SOCKET_URL = 'http://localhost:5000';

const createClient = (name) => {
  const socket = io(SOCKET_URL, {
    transports: ['websocket'],
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      console.log(`✅ ${name} connected: ${socket.id}`);
      resolve(socket);
    });
  });
};

const runTest = async () => {
  console.log('🚀 Starting Socket.io Signaling Test...');

  try {
    const client1 = await createClient('Client 1');
    const client2 = await createClient('Client 2');

    const roomId = 'test-room-999';

    // Client 1 joins
    console.log('\n--- Client 1 Joining ---');
    client1.emit('join-room', { roomId, userId: 'u1', userName: 'Alice' });

    await new Promise((resolve) => {
      client1.on('room-info', (data) => {
        console.log('Client 1 received room-info:', data);
        resolve();
      });
    });

    // Client 2 joins
    console.log('\n--- Client 2 Joining ---');
    
    const userJoinedPromise = new Promise((resolve) => {
      client1.on('user-joined', (data) => {
        console.log('Client 1 notified: User joined:', data);
        resolve();
      });
    });

    client2.emit('join-room', { roomId, userId: 'u2', userName: 'Bob' });

    await userJoinedPromise;

    // Test WebRTC Signaling (Offer from Client 1 to Client 2)
    console.log('\n--- WebRTC Signaling Test ---');
    
    const offerPromise = new Promise((resolve) => {
      client2.on('offer', (data) => {
        console.log('Client 2 received offer from:', data.from);
        resolve();
      });
    });

    client1.emit('offer', { to: client2.id, offer: { type: 'offer', sdp: 'test-sdp' } });
    await offerPromise;

    // Test Chat Message
    console.log('\n--- Chat Message Test ---');
    
    const chatPromise = new Promise((resolve) => {
      client1.on('chat-message', (data) => {
        console.log('Client 1 received chat:', data.message, 'from', data.senderName);
        resolve();
      });
    });

    client2.emit('chat-message', { roomId, message: 'Hello Alice!', senderName: 'Bob', senderId: 'u2' });
    await chatPromise;

    console.log('\n✅ All Socket events verified successfully!');
    
    client1.disconnect();
    client2.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
};

runTest();
