import { useRef, useState, useEffect, useCallback } from 'react';

export function AudioPlayer({ src, sessionId, logEvent, itemLabel = 'Conversation' }) {
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
    if (playing) el.pause();
    else el.play();
    setPlaying(!playing);
  };

  const handleReplay = () => {
    const el = audioRef.current;
    if (el) {
      el.currentTime = 0;
      el.play();
      setPlaying(true);
    }
    if (sessionId && logEvent) logEvent(sessionId, 'replay', 1);
  };

  const skip = (delta) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + delta));
    setCurrentTime(el.currentTime);
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
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="rounded-2xl bg-[var(--color-card)] shadow-md border border-[var(--color-border)] overflow-hidden">
      <div className="p-4 border-b border-[var(--color-border)]">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase">{itemLabel}</span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-[var(--color-accent)] text-[var(--color-text)] flex items-center justify-center hover:opacity-90 transition shadow-md border border-[var(--color-primary)]/20"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button type="button" onClick={() => skip(-10)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" title="Back 10s">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
          </button>
          <button type="button" onClick={() => skip(10)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" title="Forward 10s">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
          </button>
          <button type="button" onClick={handleReplay} className="text-sm font-medium text-[var(--color-primary)] hover:underline">
            Replay
          </button>
          <div className="flex-1 min-w-[200px] flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)] tabular-nums w-10">{formatTime(currentTime)}</span>
            <div
              className="flex-1 h-2 bg-[var(--color-border)] rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
              role="progressbar"
            >
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
              />
            </div>
            <span className="text-sm text-[var(--color-text-muted)] tabular-nums w-10">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
