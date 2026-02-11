import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-slate-600">Starting session...</p></div>;
  if (error) return <div className="min-h-screen bg-surface p-6"><p className="text-red-600">{error}</p><button type="button" onClick={() => navigate('/')} className="mt-4 text-primary">Back</button></div>;

  if (finished && scoreReport) {
    return (
      <div className="min-h-screen bg-surface p-6">
        <div className="max-w-2xl mx-auto">
          <ScoreReportView report={scoreReport} />
          <button type="button" onClick={() => navigate('/')} className="mt-6 text-primary hover:underline">Back to home</button>
        </div>
      </div>
    );
  }

  const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '');
  let audioSrc = currentItem?.audio_source || currentItem?.audio_url || '';
  if (audioSrc && !audioSrc.startsWith('http')) audioSrc = `${apiOrigin}${audioSrc}`;

  return (
    <div className="min-h-screen bg-surface p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button type="button" onClick={() => navigate('/')} className="text-primary hover:underline text-sm">← Exit</button>
          <span className="text-slate-500 text-sm">Question {questionIndex + 1} of {questionsList.length}</span>
        </div>

        {currentItem && (
          <>
            <div className="mb-4">
              <AudioPlayer
                src={audioSrc}
                sessionId={session?.id}
                logEvent={logEvent}
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
            />
          </div>
        )}

        {mode === 'practice' && feedback && !isLastQuestion && (
          <button type="button" onClick={goToNext} className="mb-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium">Next question</button>
        )}
        {isLastQuestion && (feedback || mode === 'exam') && (
          <button type="button" onClick={handleFinish} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium">Finish</button>
        )}

        {questionsList.length === 0 && <p className="text-slate-500">No questions in this test.</p>}
      </div>
    </div>
  );
}
