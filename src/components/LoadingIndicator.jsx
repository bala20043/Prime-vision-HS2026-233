/**
 * LoadingIndicator — Three-dot staggered pulse.
 * "Analyzing knowledge base…" message with animated dots.
 */
export default function LoadingIndicator({ text = 'Analyzing knowledge base' }) {
  return (
    <div className="flex items-center gap-2 text-muted-text font-body text-small py-3 px-4">
      <span>{text}</span>
      <span className="flex gap-1">
        <span className="loading-dot w-1.5 h-1.5 rounded-full bg-indigo inline-block" />
        <span className="loading-dot w-1.5 h-1.5 rounded-full bg-indigo inline-block" />
        <span className="loading-dot w-1.5 h-1.5 rounded-full bg-indigo inline-block" />
      </span>
    </div>
  );
}
