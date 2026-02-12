export function ScoreReportView({ report }) {
  if (!report) return null;
  const subs = [
    { key: 'main_idea', label: 'Main Idea' },
    { key: 'detail', label: 'Detail' },
    { key: 'inference', label: 'Inference' },
    { key: 'organization', label: 'Organization' },
    { key: 'pragmatic', label: 'Pragmatic' },
  ];
  return (
    <div className="rounded-2xl bg-[var(--color-card)] shadow-md border border-[var(--color-border)] p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--color-text)] text-center mb-2">
        Test Results Review
      </h2>
      <p className="text-[var(--color-text-muted)] text-center mb-8">
        Review your performance on the recent practice test.
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Answered Questions</p>
          <p className="text-xl font-bold text-[var(--color-text)]">{report.total_score !== undefined ? '—' : '0'}/28</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Correct Answers</p>
          <p className="text-xl font-bold text-[var(--color-text)]">—/28</p>
        </div>
        <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Score</p>
          <p className="text-xl font-bold text-[var(--color-primary)]">{report.total_score ?? 0}/30</p>
        </div>
      </div>

      {/* Total score highlight */}
      <div className="text-center py-4 mb-6 border-y border-[var(--color-border)]">
        <span className="text-4xl font-bold text-[var(--color-primary)]">{report.total_score ?? 0}</span>
        <span className="text-[var(--color-text-muted)] ml-1">/ 30</span>
      </div>

      <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Detailed Review</h3>
      <ul className="space-y-3">
        {subs.map(({ key, label }) => (
          <li key={key} className="flex justify-between text-[var(--color-text)] py-2 border-b border-[var(--color-border)] last:border-0">
            <span>{label}</span>
            <span className="font-semibold">{report[key] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
