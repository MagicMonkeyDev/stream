import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useStreamStore } from '../store/useStreamStore';

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:3001';

export const useSignaling = () => {
  const { setSocket, addPeer, removePeer } = useStreamStore();

  const connect = useCallback(() => {
    const socket = io(SIGNALING_SERVER, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      setSocket(socket);
    });

    socket.on('viewer-joined', ({ viewerId, streamId }) => {
      console.log('Viewer joined:', viewerId);
      addPeer(viewerId, true);
    });

    socket.on('signal', async ({ from, signal }) => {
      const peers = useStreamStore.getState().peers;
      const peer = peers.get(from)?.connection;
      
      if (peer) {
        try {
          if (signal.type === 'offer') {
            await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit('signal', {
              to: from,
              signal: { type: 'answer', sdp: answer }
            });
          } else if (signal.type === 'answer') {
            await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          } else if (signal.type === 'candidate') {
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (error) {
          console.error('Error handling signal:', error);
        }
      }
    });

    socket.on('stream-updated', (activeStreams) => {
      useStreamStore.getState().setActiveStreams(activeStreams);
    });

    socket.on('viewer-left', ({ viewerId }) => {
      removePeer(viewerId);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return socket;
  }, []);

  useEffect(() => {
    const socket = connect();
    return () => {
      socket.disconnect();
    };
  }, [connect]);

  return {
    startStream: (streamId: string) => {
      const socket = useStreamStore.getState().socket;
      if (socket) {
        socket.emit('stream-start', streamId);
      }
    },
    stopStream: (streamId: string) => {
      const socket = useStreamStore.getState().socket;
      if (socket) {
        socket.emit('stream-stop', streamId);
      }
    },
    joinStream: (streamId: string) => {
      const socket = useStreamStore.getState().socket;
      if (socket) {
        socket.emit('join-stream', streamId);
      }
    }
  };
};