import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { AudioPlayer } from '../components/AudioPlayer';
import { Transcript } from '../components/Transcript';
import { QuestionCard } from '../components/QuestionCard';
import { ScoreReportView } from '../components/ScoreReportView';

function flattenQuestions(allItems) {
  const list = [];
  (allItems || []).forEach((item) => {
    (item.questions || []).forEach((q) => list.push({ ...q, itemId: item.id, item }));
  });
  return list;
}

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
  const answerStartRef = useRef(null);

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
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [testId, mode]);

  useEffect(() => {
    if (!session || !currentQ) return;
    setCurrentItem(currentQ.item || null);
    setCurrentQuestion(currentQ);
  }, [currentQ, session]);

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

  return (
    <div className="min-h-screen bg-[var(--color-surface)] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Figma-style header: title, REAL 1, listening • Number 1, Volume, Quit */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)]">
              {mode === 'practice' ? 'Practice mode' : 'Exam Mode'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              {testTitle} · listening · Number {questionIndex + 1}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">Volume</span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Quit
            </Link>
          </div>
        </header>

        {currentItem && (
          <>
            <div className="mb-6">
              <AudioPlayer
                src={audioSrc}
                sessionId={session?.id}
                logEvent={logEvent}
                itemLabel={itemType}
              />
            </div>
            <div className="mb-6">
              <Transcript text={currentItem.transcript} />
            </div>
          </>
        )}

        {currentQuestion && (
          <div className="mb-6" onFocus={() => { answerStartRef.current = performance.now(); }}>
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

        {/* Fallback Continue/Finish when QuestionCard doesn't show it */}
        {mode === 'practice' && feedback && !isLastQuestion && (
          <div className="flex justify-end">
            <button type="button" onClick={goToNext} className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">
              Continue →
            </button>
          </div>
        )}
        {isLastQuestion && (feedback || mode === 'exam') && (
          <div className="flex justify-end">
            <button type="button" onClick={handleFinish} className="px-6 py-2.5 rounded-xl bg-[var(--color-accent)] text-[var(--color-text)] font-semibold border border-[var(--color-primary)]/20 hover:opacity-90">
              Finish
            </button>
          </div>
        )}

        {questionsList.length === 0 && <p className="text-[var(--color-text-muted)]">No questions in this test.</p>}
      </div>
    </div>
  );
}
