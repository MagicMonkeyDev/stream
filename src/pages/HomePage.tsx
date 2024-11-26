import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { StreamCard } from '../components/StreamCard';
import { CreateStreamModal } from '../components/CreateStreamModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';
import { useStreams } from '../context/StreamContext';

export const HomePage: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connected } = useWallet();
  const navigate = useNavigate();
  const { streams, addStream } = useStreams();

  const handleCreateStream = (data: { title: string; description: string }) => {
    const streamId = addStream(data.title, data.description);
    navigate(`/stream/${streamId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">SolanaStream</span>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Live Streams</h1>
          {connected && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Start Stream
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.id} {...stream} />
          ))}
        </div>

        {!connected && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to start streaming</p>
          </div>
        )}
      </main>

      <CreateStreamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStream}
      />
    </div>
  );
};