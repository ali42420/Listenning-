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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Score Report</h2>
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-primary">{report.total_score}</span>
        <span className="text-slate-500 ml-1">/ 30</span>
      </div>
      <ul className="space-y-2">
        {subs.map(({ key, label }) => (
          <li key={key} className="flex justify-between text-slate-700">
            <span>{label}</span>
            <span className="font-medium">{report[key] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
