import create from 'zustand';
import { Socket } from 'socket.io-client';

interface RTCPeerData {
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface StreamStore {
  socket: Socket | null;
  peers: Map<string, RTCPeerData>;
  activeStreams: string[];
  localStream: MediaStream | null;
  setSocket: (socket: Socket) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addPeer: (peerId: string, initiator: boolean) => void;
  removePeer: (peerId: string) => void;
  setActiveStreams: (streams: string[]) => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

export const useStreamStore = create<StreamStore>((set, get) => ({
  socket: null,
  peers: new Map(),
  activeStreams: [],
  localStream: null,

  setSocket: (socket) => set({ socket }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setActiveStreams: (streams) => set({ activeStreams: streams }),

  addPeer: async (peerId, initiator) => {
    const { localStream, peers, socket } = get();
    
    if (peers.has(peerId)) return;

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit('signal', {
          to: peerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      peers.set(peerId, { 
        connection: peerConnection,
        stream: remoteStream 
      });
      set({ peers: new Map(peers) });
    };

    if (initiator) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket?.emit('signal', {
          to: peerId,
          signal: { type: 'offer', sdp: offer }
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }

    peers.set(peerId, { connection: peerConnection });
    set({ peers: new Map(peers) });
  },

  removePeer: (peerId) => {
    const { peers } = get();
    const peer = peers.get(peerId);
    if (peer) {
      peer.connection.close();
      peers.delete(peerId);
      set({ peers: new Map(peers) });
    }
  }
}));