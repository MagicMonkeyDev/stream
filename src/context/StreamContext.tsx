import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Peer from 'simple-peer';

export interface Stream {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAddress: string;
  thumbnailUrl: string;
  viewers: number;
  isLive: boolean;
  isAudioOnly?: boolean;
  createdAt: Date;
  signal?: any;
  viewerSignal?: any;
}

interface StreamContextType {
  streams: Stream[];
  addStream: (title: string, description: string) => string;
  updateStreamStatus: (id: string, isLive: boolean) => void;
  updateStreamSignal: (id: string, signal: any, isViewer?: boolean) => void;
  getStream: (id: string) => Stream | undefined;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

const INITIAL_STREAMS = [
  {
    id: '1',
    title: 'NFT Showcase & Giveaway',
    description: 'Join us for an exclusive NFT showcase!',
    creator: 'CryptoArtist',
    creatorAddress: '7cVf...3Pds',
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    viewers: 1234,
    isLive: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'DeFi Trading Strategies',
    description: 'Learn advanced DeFi trading techniques',
    creator: 'SolanaTrader',
    creatorAddress: '3xKm...9Qws',
    thumbnailUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800',
    viewers: 856,
    isLive: true,
    createdAt: new Date(),
  },
];

export function StreamProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [streams, setStreams] = useState<Stream[]>(INITIAL_STREAMS);

  const addStream = useCallback((title: string, description: string): string => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    const newStream: Stream = {
      id: Date.now().toString(),
      title,
      description,
      creator: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
      creatorAddress: publicKey.toString(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
      viewers: 0,
      isLive: false,
      createdAt: new Date(),
    };

    setStreams(prev => [newStream, ...prev]);
    return newStream.id;
  }, [publicKey]);

  const updateStreamStatus = useCallback((id: string, isLive: boolean) => {
    setStreams(prev => prev.map(stream => 
      stream.id === id ? { ...stream, isLive, viewers: isLive ? stream.viewers + 1 : stream.viewers - 1 } : stream
    ));
  }, []);

  const updateStreamSignal = useCallback((id: string, signal: any, isViewer: boolean = false) => {
    setStreams(prev => prev.map(stream =>
      stream.id === id 
        ? { 
            ...stream, 
            ...(isViewer ? { viewerSignal: signal } : { signal })
          } 
        : stream
    ));
  }, []);

  const getStream = useCallback((id: string) => {
    return streams.find(stream => stream.id === id);
  }, [streams]);

  return (
    <StreamContext.Provider value={{ streams, addStream, updateStreamStatus, updateStreamSignal, getStream }}>
      {children}
    </StreamContext.Provider>
  );
}

export function useStreams() {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error('useStreams must be used within a StreamProvider');
  }
  return context;
}