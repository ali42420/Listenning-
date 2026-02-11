import { useState } from 'react';

export function QuestionCard({
  question,
  onSubmit,
  disabled,
  feedback,
  mode,
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-slate-800 font-medium mb-4">{question?.text}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = opt.is_correct;
          const showCorrect = showFeedback && feedback.correct_option_id === opt.id;
          const showWrong = showFeedback && isSelected && !feedback.is_correct;
          let bg = 'bg-slate-50 hover:bg-slate-100 border-slate-200';
          if (showCorrect) bg = 'bg-green-50 border-green-500';
          if (showWrong) bg = 'bg-red-50 border-red-400';
          if (submitted && !showFeedback && isSelected) bg = 'bg-primary/10 border-primary';

          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted || disabled}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${bg}`}
            >
              <span className="font-medium text-slate-600">{opt.label}. </span>
              <span className="text-slate-800">{opt.text}</span>
              {showCorrect && <span className="ml-2 text-green-600">✓ Correct</span>}
              {showWrong && <span className="ml-2 text-red-600">✗</span>}
            </button>
          );
        })}
      </div>
      {showFeedback && feedback.explanation && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-1">Why this is correct</p>
          <p className="text-slate-600 text-sm">{feedback.explanation}</p>
        </div>
      )}
      {!submitted && selectedId && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium disabled:opacity-50"
        >
          Submit Answer
        </button>
      )}
    </div>
  );
}
