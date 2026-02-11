export function Transcript({ text, className = '' }) {
  if (!text) return null;
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 text-slate-700 leading-relaxed whitespace-pre-wrap ${className}`}>
      {text}
    </div>
  );
}
