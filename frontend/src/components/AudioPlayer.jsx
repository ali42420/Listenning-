import { useRef, useState, useEffect, useCallback } from 'react';

export function AudioPlayer({ src, onReplay, sessionId, logEvent }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const updateTime = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      setCurrentTime(el.currentTime);
      setDuration(el.duration || 0);
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.addEventListener('timeupdate', updateTime);
    el.addEventListener('loadedmetadata', updateTime);
    el.addEventListener('ended', () => setPlaying(false));
    return () => {
      el.removeEventListener('timeupdate', updateTime);
      el.removeEventListener('loadedmetadata', updateTime);
    };
  }, [updateTime, src]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  };

  const handleReplay = () => {
    const el = audioRef.current;
    if (el) {
      el.currentTime = 0;
      el.play();
      setPlaying(true);
    }
    onReplay?.();
    if (sessionId && logEvent) logEvent(sessionId, 'replay', 1);
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    el.currentTime = p * el.duration;
    setCurrentTime(el.currentTime);
  };

  const formatTime = (t) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="rounded-xl bg-slate-100 border border-slate-200 p-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleReplay}
          className="text-sm font-medium text-primary hover:underline"
        >
          Replay
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-slate-500 tabular-nums">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-2 bg-slate-200 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
            role="progressbar"
            aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
            />
          </div>
          <span className="text-sm text-slate-500 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
