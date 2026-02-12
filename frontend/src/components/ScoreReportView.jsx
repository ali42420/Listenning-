import { Link } from 'react-router-dom';

export function ScoreReportView({ report }) {
  if (!report) return null;

  const totalQuestions = report.total_questions ?? 0;
  const answeredCount = report.answered_count ?? 0;
  const correctCount = report.correct_count ?? 0;
  const score = report.total_score ?? 0;
  const maxScore = 30;
  const detailed = report.detailed_answers || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Header: Test Prep Pro (left) | bell + Quit (right) */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">+ Test Prep Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-100 text-gray-800 font-semibold border border-amber-200 hover:bg-amber-200 transition"
          >
            Quit
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Test Results Review
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          Review your performance on the recent practice test.
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Answered Questions</p>
            <p className="text-xl font-bold text-gray-900">
              {answeredCount}/{totalQuestions || '—'}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Correct Answers</p>
            <p className="text-xl font-bold text-gray-900">
              {correctCount}/{totalQuestions || '—'}
            </p>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-5 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Score</p>
            <p className="text-xl font-bold text-gray-900">
              {score}/{maxScore}
            </p>
          </div>
        </div>

        {/* Detailed Review table */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Review</h3>
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-sm font-semibold text-gray-800">ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-800">Question</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-800">Correct Answer</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-800">Your Answer</th>
              </tr>
            </thead>
            <tbody>
              {detailed.length > 0 ? (
                detailed.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-600">{row.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.question_text}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.correct_answer}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.your_answer}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                    No answers to review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block text-gray-700 font-medium hover:underline"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
