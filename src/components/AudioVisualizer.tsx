import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface AudioVisualizerProps {
  stream: MediaStream;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#8b5cf6',
      progressColor: '#6d28d9',
      cursorWidth: 0,
      barWidth: 2,
      barGap: 3,
      height: 100,
      barRadius: 3,
      normalize: true,
      mediaControls: true
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const animate = () => {
      analyser.getByteTimeDomainData(dataArray);
      const normalizedData = Array.from(dataArray).map(value => value / 128 - 1);
      wavesurfer.loadDecodedBuffer(normalizedData as any);
      requestAnimationFrame(animate);
    };

    animate();
    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
      audioContext.close();
    };
  }, [stream]);

  return (
    <div className="w-full h-[100px] bg-gray-800/50 rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};