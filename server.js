// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', roomId => {
    socket.join(roomId);
    socket.to(roomId).emit('peer-joined', socket.id);
  });

  socket.on('signal', ({ roomId, data }) => {
    socket.to(roomId).emit('signal', {
      from: socket.id,
      data
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('TimberNova WebRTC signaling server is running.');
});

server.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
