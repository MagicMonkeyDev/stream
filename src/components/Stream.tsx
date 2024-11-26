import React, { useRef, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Users, Share2, Heart, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { Chat } from './Chat';
import { useParams, useNavigate } from 'react-router-dom';
import { useStreams } from '../context/StreamContext';
import SimplePeer from 'simple-peer';
import { AudioVisualizer } from './AudioVisualizer';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const Stream: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [liked, setLiked] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { streams, updateStreamStatus } = useStreams();

  const stream = streams.find(s => s.id === id);
  const isStreamOwner = connected && stream?.creatorAddress === publicKey?.toString();

  useEffect(() => {
    if (!stream) {
      navigate('/');
      return;
    }

    if (!isStreamOwner && stream.isLive) {
      initViewerPeer();
    }

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, isStreamOwner, navigate]);

  const initViewerPeer = () => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      config: ICE_SERVERS
    });

    peer.on('signal', data => {
      console.log('Viewer signal:', data);
    });

    peer.on('stream', stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    peerRef.current = peer;
  };

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: !isAudioOnly,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      streamRef.current = mediaStream;

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
        config: ICE_SERVERS
      });

      peer.on('signal', data => {
        console.log('Broadcaster signal:', data);
      });

      peerRef.current = peer;
      setIsStreaming(true);
      
      if (id) {
        updateStreamStatus(id, true);
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      streamRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setIsStreaming(false);
    if (id) {
      updateStreamStatus(id, false);
    }
  };

  const shareStream = async () => {
    if (!stream) return;
    
    try {
      await navigator.share({
        title: stream.title,
        text: `Watch ${stream.title} live on SolanaStream!`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing stream:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {(!isAudioOnly || !isStreamOwner) && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isStreamOwner}
                  className="w-full h-full object-cover"
                />
              )}
              
              {isAudioOnly && isStreamOwner && streamRef.current && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 p-8">
                  <Mic className="w-16 h-16 text-purple-400 mb-4" />
                  <p className="text-white text-lg font-medium mb-8">Audio Only Stream</p>
                  <AudioVisualizer stream={streamRef.current} />
                </div>
              )}
              
              {isStreamOwner && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {isStreaming ? (
                    <button
                      onClick={stopStream}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      {isAudioOnly ? <MicOff className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      End Stream
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsAudioOnly(!isAudioOnly)}
                        className={`px-4 py-2 ${
                          isAudioOnly ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-200'
                        } hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-colors`}
                      >
                        {isAudioOnly ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        {isAudioOnly ? 'Audio Only' : 'Video + Audio'}
                      </button>
                      <button
                        onClick={startStream}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        {isAudioOnly ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        Start Stream
                      </button>
                    </>
                  )}
                </div>
              )}

              {stream?.isLive && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-sm font-semibold bg-red-500 text-white rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{stream?.title}</h3>
                    <p className="text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{stream?.viewers} watching</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setLiked(!liked)}
                    className={`p-2 rounded-full transition-colors ${
                      liked ? 'bg-pink-500/20 text-pink-500' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    <Heart className="w-6 h-6" fill={liked ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={shareStream}
                    className="p-2 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                  <WalletMultiButton />
                </div>
              </div>
              
              <p className="text-gray-300">{stream?.description}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};