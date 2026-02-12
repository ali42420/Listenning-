import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import AudioPlayer from '../components/AudioPlayer';
import { QuestionCard } from '../components/QuestionCard';
import { ScoreReportView } from '../components/ScoreReportView';
import { Modal } from '../components/Modal';
import { SettingsModal } from '../components/SettingsModal';
import { loadSettings } from '../lib/settings';
import { useBackgroundNoise } from '../hooks/useBackgroundNoise';

function flattenQuestions(allItems) {
  const list = [];
  (allItems || []).forEach((item) => {
    (item.questions || []).forEach((q) => list.push({ ...q, itemId: item.id, item }));
  });
  return list;
}

const IconButton = ({ onClick, children, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
    title={label}
    aria-label={label}
  >
    {children}
  </button>
);

export function ListeningPage() {
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const mode = searchParams.get('mode') || 'practice';
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [scoreReport, setScoreReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('player'); // 'player' | 'questions'
  const [modal, setModal] = useState(null);   // 'review' | 'transcript' | 'settings' | null
  const [settingsSnapshot, setSettingsSnapshot] = useState(() => loadSettings());
  const answerStartRef = useRef(null);

  const isListeningActive = phase === 'player' || phase === 'questions';
  useBackgroundNoise(
    isListeningActive && settingsSnapshot.exam.playBackgroundNoise,
    settingsSnapshot.exam.backgroundNoiseVolume
  );

  const questionsList = flattenQuestions(allItems);
  const currentQ = questionsList[questionIndex] || null;
  const isLastQuestion = questionIndex >= questionsList.length - 1 && questionsList.length > 0;

  const logEvent = useCallback((sid, eventType, count, extra) => {
    api.logEvent(sid, eventType, count, extra).catch(() => {});
  }, []);

  useEffect(() => {
    if (!testId) {
      setError('Missing test');
      setLoading(false);
      return;
    }
    api.startSession(Number(testId), mode)
      .then((data) => {
        setSession(data.session);
        setAllItems(data.all_items || []);
        setCurrentItem(data.current_item || null);
        setCurrentQuestion(data.current_question || null);
        setQuestionIndex(0);
        setPhase('player');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [testId, mode]);

  useEffect(() => {
    if (!session || !allItems?.length) return;
    const list = flattenQuestions(allItems);
    const q = list[questionIndex];
    if (!q) return;
    setCurrentItem(q.item || null);
    setCurrentQuestion(q);
  }, [session?.id, questionIndex, allItems]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && session?.id) {
        logEvent(session.id, 'focus_loss', 1, { visibility: 'hidden' });
      }
    };
    const handleBlur = () => {
      if (session?.id) logEvent(session.id, 'focus_loss', 1, { event: 'window_blur' });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [session?.id, logEvent]);

  const handleSubmitAnswer = (optionId) => {
    if (!session || !currentQ) return;
    const responseTimeMs = answerStartRef.current ? Math.round(performance.now() - answerStartRef.current) : null;
    setFeedback(null);
    api.submitAnswer(session.id, currentQ.id, optionId, responseTimeMs)
      .then((res) => {
        setFeedback(res);
        if (isLastQuestion) return;
        setQuestionIndex((i) => i + 1);
        setFeedback(null);
      })
      .catch((e) => setError(e.message));
  };

  const handleFinish = () => {
    if (!session) return;
    api.finishSession(session.id)
      .then((report) => {
        setFinished(true);
        setScoreReport(report);
      })
      .catch((e) => setError(e.message));
  };

  const goToNext = () => {
    if (questionIndex < questionsList.length - 1) {
      setQuestionIndex((i) => i + 1);
      setFeedback(null);
    }
  };

  const handleAudioEnded = useCallback(() => {
    setPhase('questions');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Starting session...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] p-6">
        <p className="text-red-600">{error}</p>
        <button type="button" onClick={() => navigate('/')} className="mt-4 text-[var(--color-primary)] hover:underline">Back to home</button>
      </div>
    );
  }

  if (finished && scoreReport) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-end mb-4">
            <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">
              Quit
            </Link>
          </div>
          <ScoreReportView report={scoreReport} />
          <button type="button" onClick={() => navigate('/')} className="mt-6 text-[var(--color-primary)] hover:underline font-medium">Back to home</button>
        </div>
      </div>
    );
  }

  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  let audioSrc = currentItem?.audio_source || currentItem?.audio_url || '';
  if (audioSrc && !audioSrc.startsWith('http')) audioSrc = `${apiOrigin}${audioSrc}`;
  const testTitle = session?.test?.title || 'Test';
  const itemType = currentItem?.item_type === 'lecture' ? 'Lecture' : 'Conversation';
  const imageLabel = currentItem?.topic_tag || (currentItem?.item_type === 'conversation' ? 'New People Conversation' : itemType);

  // ---------- Phase: Player (lecture only, no transcript on page) ----------
  if (phase === 'player' && currentItem) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
        {/* Header: REAL 1 + listening • Number 1 | Review, Transcript, Settings | Hamburger */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--color-text)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            <div>
              <p className="text-sm font-bold text-[var(--color-text)] leading-tight">{testTitle}</p>
              <p className="text-xs text-[var(--color-text-muted)] leading-tight">listening • Number 1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode !== 'exam' && (
              <button type="button" onClick={() => setModal('review')} className="px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg">Review</button>
            )}
            {mode !== 'exam' && (
              <button type="button" onClick={() => setModal('transcript')} className="px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg">Transcript</button>
            )}
            {mode !== 'exam' && (
              <button type="button" onClick={() => setModal('settings')} className="px-3 py-1.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg">Settings</button>
            )}
            <button type="button" className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90" aria-label="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <AudioPlayer
              src={audioSrc}
              sessionId={session?.id}
              logEvent={logEvent}
              imageLabel={imageLabel}
              onEnded={handleAudioEnded}
              mode={mode}
            />
          </div>
        </main>

        {/* Footer: Back (left) | Continue with yellow arrow (right) */}
        <footer className="flex items-center justify-between px-4 py-4 border-t border-[var(--color-border)] bg-[var(--color-card)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <button
            type="button"
            onClick={() => setPhase('questions')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)]"
          >
            Continue
            <span className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center border-2 border-[var(--color-primary)]/20">
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        </footer>

        {/* Modals (popups with animation) */}
        {mode !== 'exam' && (
          <Modal open={modal === 'transcript'} onClose={() => setModal(null)} title="Transcript">
            <p className="text-sm text-[var(--color-text-muted)] mb-2 underline">Follow the line</p>
            <div className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{currentItem?.transcript || 'No transcript.'}</div>
          </Modal>
        )}
        {mode !== 'exam' && (
          <Modal open={modal === 'review'} onClose={() => setModal(null)} title="Review">
            <p className="text-[var(--color-text-muted)] text-sm">Review your answers and notes after completing the questions.</p>
          </Modal>
        )}
        {mode !== 'exam' && (
          <SettingsModal
            open={modal === 'settings'}
            onClose={() => setModal(null)}
            onSave={(s) => setSettingsSnapshot(s)}
          />
        )}
      </div>
    );
  }

  // ---------- Phase: Questions (header with icons like Figma) ----------
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Header: + Test Prep Pro | Quit, Back, icons */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--color-text)]">+ Test Prep Pro</span>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">Quit</Link>
          <button type="button" onClick={() => setPhase('player')} className="px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg">Back</button>
          {mode !== 'exam' && (
            <IconButton onClick={() => setModal('review')} label="Review">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </IconButton>
          )}
          {mode !== 'exam' && (
            <IconButton onClick={() => setModal('transcript')} label="Transcript">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            </IconButton>
          )}
          <IconButton label="Notes"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></IconButton>
          <IconButton label="Question list"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></IconButton>
          {mode !== 'exam' && (
            <IconButton onClick={() => setModal('settings')} label="Settings">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </IconButton>
          )}
          <IconButton label="Audio"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></IconButton>
          <div className="w-8 h-8 rounded-full bg-[var(--color-border)] flex items-center justify-center ml-1">
            <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        {currentQuestion && (
          <div onFocus={() => { answerStartRef.current = performance.now(); }}>
            <QuestionCard
              question={currentQuestion}
              onSubmit={handleSubmitAnswer}
              disabled={false}
              feedback={feedback}
              mode={mode}
              questionIndex={questionIndex}
              totalQuestions={questionsList.length}
            />
          </div>
        )}

        {mode === 'practice' && feedback && !isLastQuestion && (
          <div className="flex justify-end mt-4">
            <button type="button" onClick={goToNext} className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">Continue →</button>
          </div>
        )}
        {isLastQuestion && (feedback || mode === 'exam') && (
          <div className="flex justify-end mt-4">
            <button type="button" onClick={handleFinish} className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">Finish</button>
          </div>
        )}

        {questionsList.length === 0 && <p className="text-[var(--color-text-muted)]">No questions.</p>}
      </main>

      {mode !== 'exam' && (
        <Modal open={modal === 'transcript'} onClose={() => setModal(null)} title="Transcript">
          <p className="text-sm text-[var(--color-text-muted)] mb-2 underline">Follow the line</p>
          <div className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{currentItem?.transcript || 'No transcript.'}</div>
        </Modal>
      )}
      {mode !== 'exam' && (
        <Modal open={modal === 'review'} onClose={() => setModal(null)} title="Review">
          <p className="text-[var(--color-text-muted)] text-sm">Review your answers after finishing the section.</p>
        </Modal>
      )}
      {mode !== 'exam' && (
        <SettingsModal
          open={modal === 'settings'}
          onClose={() => setModal(null)}
          onSave={(s) => setSettingsSnapshot(s)}
        />
      )}
    </div>
  );
}
