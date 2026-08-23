import { BookOpen } from 'lucide-react';

/**
 * SourceCard — Displays source + evidence for a supported answer.
 * Evidence text uses IBM Plex Mono to mark it as "retrieved, not generated."
 */
export default function SourceCard({ source, evidence }) {
  return (
    <div className="mt-3 pt-3 border-t border-hairline space-y-2">
      {/* Source */}
      {source && (
        <div className="flex items-center gap-2 text-small text-muted-text">
          <BookOpen size={14} className="text-indigo flex-shrink-0" />
          <span className="font-medium">{source}</span>
        </div>
      )}

      {/* Evidence */}
      {evidence && (
        <div className="bg-parchment rounded-button p-3 border border-hairline/50">
          <p className="text-micro text-muted-text mb-1 font-medium uppercase tracking-wider">
            Evidence
          </p>
          <p className="font-mono text-small text-ink leading-relaxed tracking-wide">
            "{evidence}"
          </p>
        </div>
      )}
    </div>
  );
}
