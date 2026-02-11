import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';

export function TestSelect() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'practice';
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTests()
      .then(setTests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><p className="text-slate-600">Loading tests...</p></div>;
  if (error) return <div className="min-h-screen bg-surface p-6"><p className="text-red-600">{error}</p></div>;

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-primary hover:underline text-sm mb-4 inline-block">← Back to mode</Link>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">Select a test</h1>
        <p className="text-slate-600 mb-6">{mode === 'practice' ? 'Practice' : 'Exam'} mode</p>
        <ul className="space-y-2">
          {tests.map((t) => (
            <li key={t.id}>
              <Link
                to={`/listening?testId=${t.id}&mode=${mode}`}
                className="block rounded-lg border border-border bg-white px-4 py-3 hover:border-primary hover:bg-slate-50 transition"
              >
                <span className="font-medium text-slate-800">{t.title}</span>
                {t.total_items > 0 && <span className="text-slate-500 text-sm ml-2">({t.total_items} items)</span>}
              </Link>
            </li>
          ))}
        </ul>
        {tests.length === 0 && <p className="text-slate-500">No tests available. Create tests in the admin.</p>}
      </div>
    </div>
  );
}
