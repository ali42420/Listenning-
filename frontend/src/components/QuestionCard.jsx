import { useState } from 'react';

export function QuestionCard({
  question,
  onSubmit,
  disabled,
  feedback,
  mode,
  questionIndex,
  totalQuestions,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (optionId) => {
    if (submitted || disabled) return;
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedId || submitted) return;
    onSubmit(selectedId);
    setSubmitted(true);
  };

  const options = question?.options || [];
  const showFeedback = mode === 'practice' && submitted && feedback;

  return (
    <div className="rounded-2xl bg-[var(--color-card)] shadow-md border border-[var(--color-border)] p-6">
      <p className="text-[var(--color-text)] font-bold text-lg mb-5">{question?.text}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const showCorrect = showFeedback && feedback.correct_option_id === opt.id;
          const showWrong = showFeedback && isSelected && !feedback.is_correct;
          let bg = 'bg-white hover:bg-[var(--color-surface)] border-[var(--color-border)]';
          let ring = '';
          if (showCorrect) {
            bg = 'bg-green-50 border-green-500';
            ring = 'ring-2 ring-green-500';
          } else if (showWrong) {
            bg = 'bg-red-50 border-red-400';
            ring = 'ring-2 ring-red-400';
          } else if (isSelected) {
            bg = 'bg-[var(--color-selected)] border-[var(--color-primary)]';
            ring = 'ring-2 ring-[var(--color-primary)]';
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted || disabled}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition flex items-center gap-3 ${bg} ${ring}`}
            >
              <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isSelected || showCorrect ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'
              }`}>
                {(isSelected || showCorrect) && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
              <span className="font-medium text-[var(--color-text-muted)]">{opt.label}.</span>
              <span className="text-[var(--color-text)]">{opt.text}</span>
              {showCorrect && <span className="ml-2 text-green-600 font-medium">✓ Correct</span>}
              {showWrong && <span className="ml-2 text-red-600">✗</span>}
            </button>
          );
        })}
      </div>
      {showFeedback && feedback.explanation && (
        <div className="mt-5 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Why this is correct</p>
          <p className="text-[var(--color-text-muted)] text-sm">{feedback.explanation}</p>
        </div>
      )}
      {!submitted && selectedId && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="mt-5 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          Submit Answer
        </button>
      )}

      {/* Pagination dots */}
      {totalQuestions > 0 && (
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--color-border)]">
          {Array.from({ length: Math.min(5, totalQuestions) }, (_, i) => (
            <span
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i === questionIndex
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              {i + 1}
            </span>
          ))}
          {totalQuestions > 5 && <span className="text-[var(--color-text-muted)] text-sm">…</span>}
        </div>
      )}
    </div>
  );
}
