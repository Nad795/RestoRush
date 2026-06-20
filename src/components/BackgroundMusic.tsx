import { useEffect, useRef, useState } from 'react';
import musicFile from '../assets/audio/Vibing Over Venus.mp3';

const STORAGE_KEY = 'restorush-music-muted';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio(musicFile);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    const startOnInteraction = () => {
      if (!audioRef.current) return;
      audioRef.current.play().then(() => setStarted(true)).catch(() => {});
    };

    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (!started && audioRef.current) {
          audioRef.current.play().then(() => setStarted(true)).catch(() => {});
        }
        setMuted((m) => !m);
      }}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-gray-800/80 border border-gray-600 hover:bg-gray-700 text-white text-lg flex items-center justify-center transition-all hover:scale-110"
      title={muted ? 'Unmute music' : 'Mute music'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
