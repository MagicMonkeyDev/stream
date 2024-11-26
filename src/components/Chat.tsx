import { FC, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useWallet } from '@solana/wallet-adapter-react';

export const Chat: FC = () => {
  const { connected } = useWallet();
  const { messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !connected) return;
    
    sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-700">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-medium">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="px-2 animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
              <div>
                <p className="text-sm">
                  <span className="text-purple-400 font-medium">{msg.user}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </p>
                <p className="text-gray-300 text-sm">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connected ? "Send a message..." : "Connect wallet to chat"}
            disabled={!connected}
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!connected}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};