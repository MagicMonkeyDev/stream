import { useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStreamStore } from '../store/useStreamStore';

const SIGNALING_SERVER = 'http://localhost:3001';

export const useSignaling = () => {
  const { setSocket, addPeer, removePeer } = useStreamStore();

  const connect = useCallback(() => {
    const socket = io(SIGNALING_SERVER);

    socket.on('connect', () => {
      console.log('Connected to signaling server');
      setSocket(socket);
    });

    socket.on('viewer-joined', ({ viewerId, streamId }) => {
      console.log('Viewer joined:', viewerId);
      addPeer(viewerId, true);
    });

    socket.on('signal', ({ from, signal }) => {
      const peer = useStreamStore.getState().peers.get(from);
      if (peer) {
        peer.signal(signal);
      }
    });

    socket.on('stream-updated', (activeStreams) => {
      useStreamStore.getState().setActiveStreams(activeStreams);
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
    },
    sendSignal: (to: string, signal: any) => {
      const socket = useStreamStore.getState().socket;
      if (socket) {
        socket.emit('signal', { to, signal });
      }
    }
  };
};