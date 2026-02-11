import { Link } from 'react-router-dom';

export function ModeSelect() {
  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">TOEFL Listening</h1>
        <p className="text-slate-600 mb-8">Choose a mode to start</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/tests?mode=practice"
            className="block rounded-xl border-2 border-border bg-white p-6 shadow-sm hover:border-primary hover:shadow transition text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Practice Mode</h2>
            <p className="text-slate-600 text-sm">Replay audio, get instant feedback and explanations.</p>
          </Link>
          <Link
            to="/tests?mode=exam"
            className="block rounded-xl border-2 border-border bg-white p-6 shadow-sm hover:border-primary hover:shadow transition text-left"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Exam Mode</h2>
            <p className="text-slate-600 text-sm">Timed test, score report at the end.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
