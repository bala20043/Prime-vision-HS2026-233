/**
 * SuggestionChip — Clickable question suggestion.
 * Hover: border shifts from hairline to indigo, bg tints gold-soft.
 */
export default function SuggestionChip({ text, onClick }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="text-left px-4 py-2.5 rounded-button border border-hairline
                 text-small text-ink font-body
                 hover:border-indigo hover:bg-gold-soft/[0.08]
                 transition-all duration-fast
                 focus-visible:ring-2 focus-visible:ring-gold"
    >
      {text}
    </button>
  );
}
