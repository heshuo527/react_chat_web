import { Server } from 'socket.io';

const io = new Server(3001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active calls and users
const users = {};
const calls = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User registers with their user ID
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle call initiation
  socket.on('call', ({ from, to, callType }) => {
    const toSocketId = users[to];
    if (toSocketId) {
      // Store the call
      calls[`${from}-${to}`] = {
        from,
        to,
        callType,
        status: 'calling'
      };
      
      io.to(toSocketId).emit('incomingCall', {
        from,
        callType,
        socketId: socket.id
      });
      console.log(`Call from ${from} to ${to} (${callType})`);
    } else {
      socket.emit('callError', { message: 'User is not online' });
    }
  });

  // Handle call acceptance
  socket.on('acceptCall', ({ from, to }) => {
    const fromSocketId = users[from];
    if (fromSocketId) {
      calls[`${from}-${to}`].status = 'active';
      io.to(fromSocketId).emit('callAccepted', { to });
      console.log(`Call accepted: ${from} -> ${to}`);
    }
  });

  // Handle call rejection
  socket.on('rejectCall', ({ from, to }) => {
    const fromSocketId = users[from];
    if (fromSocketId) {
      calls[`${from}-${to}`].status = 'rejected';
      io.to(fromSocketId).emit('callRejected', { to });
      console.log(`Call rejected: ${from} -> ${to}`);
    }
  });

  // Handle call end
  socket.on('endCall', ({ from, to }) => {
    const toSocketId = users[to];
    if (toSocketId) {
      delete calls[`${from}-${to}`];
      delete calls[`${to}-${from}`];
      io.to(toSocketId).emit('callEnded', { from });
      console.log(`Call ended: ${from} -> ${to}`);
    }
  });

  // Handle WebRTC signaling: offer
  socket.on('offer', ({ from, to, offer }) => {
    const toSocketId = users[to];
    if (toSocketId) {
      io.to(toSocketId).emit('offer', { from, offer });
      console.log(`Offer sent: ${from} -> ${to}`);
    }
  });

  // Handle WebRTC signaling: answer
  socket.on('answer', ({ from, to, answer }) => {
    const toSocketId = users[to];
    if (toSocketId) {
      io.to(toSocketId).emit('answer', { from, answer });
      console.log(`Answer sent: ${from} -> ${to}`);
    }
  });

  // Handle ICE candidates
  socket.on('iceCandidate', ({ from, to, candidate }) => {
    const toSocketId = users[to];
    if (toSocketId) {
      io.to(toSocketId).emit('iceCandidate', { from, candidate });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and remove the user
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

console.log('Socket.io server running on port 3001');