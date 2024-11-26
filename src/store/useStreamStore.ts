import create from 'zustand';
import { Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';

interface StreamStore {
  socket: Socket | null;
  peers: Map<string, SimplePeer.Instance>;
  activeStreams: string[];
  localStream: MediaStream | null;
  setSocket: (socket: Socket) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addPeer: (peerId: string, initiator: boolean) => void;
  removePeer: (peerId: string) => void;
  setActiveStreams: (streams: string[]) => void;
}

export const useStreamStore = create<StreamStore>((set, get) => ({
  socket: null,
  peers: new Map(),
  activeStreams: [],
  localStream: null,

  setSocket: (socket) => set({ socket }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setActiveStreams: (streams) => set({ activeStreams: streams }),

  addPeer: (peerId, initiator) => {
    const { localStream, peers } = get();
    
    if (peers.has(peerId)) return;

    const peer = new SimplePeer({
      initiator,
      stream: localStream || undefined,
      trickle: false,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (signal) => {
      get().socket?.emit('signal', { to: peerId, signal });
    });

    peer.on('stream', (stream) => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
    });

    peers.set(peerId, peer);
    set({ peers: new Map(peers) });
  },

  removePeer: (peerId) => {
    const { peers } = get();
    const peer = peers.get(peerId);
    if (peer) {
      peer.destroy();
      peers.delete(peerId);
      set({ peers: new Map(peers) });
    }
  }
}));