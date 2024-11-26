import { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'CryptoFan', message: 'Amazing stream!', timestamp: new Date() },
    { id: '2', user: 'Web3Explorer', message: 'Keep up the great content', timestamp: new Date() },
  ]);

  const sendMessage = useCallback((message: string) => {
    if (!message.trim() || !publicKey) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4),
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
  }, [publicKey]);

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}