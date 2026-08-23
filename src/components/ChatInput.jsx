import { useState, useRef } from 'react';
import { Send, Mic } from 'lucide-react';
import { useLanguage } from '../App';

/**
 * ChatInput — Message composer with Send button.
 * Enter → submit, Shift+Enter → new line.
 * Prevents empty submissions. Loading state shows three-dot pulse.
 */
export default function ChatInput({ onSend, isLoading = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const { t } = useLanguage();

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
  };

  return (
    <div className="border-t border-hairline bg-surface p-4">
      <div className="flex items-end gap-3 max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            rows={1}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-parchment border border-hairline rounded-card
                       text-body text-ink font-body placeholder:text-muted-text/60
                       resize-none overflow-hidden
                       focus:outline-none focus:border-indigo focus:shadow-sm
                       transition-all duration-fast
                       disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Type your question"
          />
        </div>

        {/* Voice placeholder */}
        <button
          className="p-3 text-muted-text hover:text-indigo transition-colors duration-fast
                     rounded-button hover:bg-parchment"
          aria-label="Voice input (coming soon)"
          title="Voice input (coming soon)"
          disabled
        >
          <Mic size={20} />
        </button>

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="p-3 bg-indigo text-parchment rounded-button
                     hover:bg-indigo-deep transition-all duration-fast
                     active:scale-[1.02]
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center min-w-[44px] min-h-[44px]"
          aria-label="Send question"
        >
          {isLoading ? (
            <span className="flex gap-1">
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
              <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
            </span>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
