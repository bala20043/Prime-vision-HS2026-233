import { useState } from 'react';
import { MessageSquarePlus, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '../App';

/**
 * Sidebar — Desktop conversation sidebar with New Chat, Recent Questions, Clear.
 * Timestamps in IBM Plex Mono at micro size for the registry-entry feel.
 */
export default function Sidebar({ conversations, onNewChat, onClear, onSelectConversation }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { t } = useLanguage();

  const handleClear = () => {
    if (showConfirm) {
      onClear();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 border-r border-hairline bg-surface">
      {/* New Chat */}
      <div className="h-16 px-4 border-b border-hairline flex items-center justify-center bg-surface">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-indigo text-parchment rounded-button text-small font-medium
                     hover:bg-indigo-deep transition-colors duration-fast
                     active:scale-[1.02]"
        >
          <MessageSquarePlus size={16} />
          {t('newChat')}
        </button>
      </div>

      {/* Recent Questions */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-micro text-muted-text font-medium uppercase tracking-wider mb-3">
          {t('recentQuestions')}
        </h4>
        {conversations.length === 0 ? (
          <p className="text-micro text-muted-text/60 italic">
            No recent questions yet
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv, i) => (
              <li key={i}>
                <button
                  onClick={() => onSelectConversation && onSelectConversation(i)}
                  className="w-full text-left px-3 py-2.5 rounded-button
                             text-small text-ink hover:bg-parchment
                             transition-colors duration-fast group"
                >
                  <p className="truncate font-medium text-ink/90 group-hover:text-ink">
                    {conv.title}
                  </p>
                  <p className="font-mono text-micro text-muted-text/60 mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {conv.timestamp}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clear Conversation */}
      <div className="p-4 border-t border-hairline">
        <button
          onClick={handleClear}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2
                     rounded-button text-small font-medium transition-all duration-fast
                     ${showConfirm
                       ? 'bg-error-rust/10 text-error-rust border border-error-rust/30'
                       : 'text-muted-text hover:text-error-rust hover:bg-error-rust/5 border border-transparent'
                     }`}
        >
          <Trash2 size={14} />
          {showConfirm ? t('clearConfirm') : t('clearConversation')}
        </button>
      </div>
    </aside>
  );
}
