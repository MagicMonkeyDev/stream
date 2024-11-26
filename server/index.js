import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Signaling server is running');
});

// Track active streams and connections
const streams = new Map();
const viewers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // When a streamer starts streaming
  socket.on('start-stream', ({ streamId, userData }) => {
    console.log('Stream started:', streamId);
    streams.set(streamId, {
      id: streamId,
      socketId: socket.id,
      ...userData
    });
    socket.join(streamId);
    io.emit('streams-updated', Array.from(streams.values()));
  });

  // When a viewer wants to watch a stream
  socket.on('join-stream', (streamId) => {
    const stream = streams.get(streamId);
    if (stream) {
      console.log('Viewer joined:', socket.id, 'Stream:', streamId);
      socket.join(streamId);
      viewers.set(socket.id, streamId);
      
      // Notify streamer about new viewer
      io.to(stream.socketId).emit('viewer-joined', {
        viewerId: socket.id,
        streamId
      });
    }
  });

  // Handle WebRTC signaling
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', {
      from: socket.id,
      signal
    });
  });

  // Handle stream ending
  socket.on('end-stream', (streamId) => {
    streams.delete(streamId);
    io.emit('streams-updated', Array.from(streams.values()));
    io.to(streamId).emit('stream-ended', streamId);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    // If disconnected socket was a streamer
    for (const [streamId, stream] of streams.entries()) {
      if (stream.socketId === socket.id) {
        streams.delete(streamId);
        io.emit('streams-updated', Array.from(streams.values()));
        io.to(streamId).emit('stream-ended', streamId);
      }
    }

    // If disconnected socket was a viewer
    const streamId = viewers.get(socket.id);
    if (streamId) {
      const stream = streams.get(streamId);
      if (stream) {
        io.to(stream.socketId).emit('viewer-left', {
          viewerId: socket.id,
          streamId
        });
      }
      viewers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});