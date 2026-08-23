import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';
import SuggestionChip from './SuggestionChip';
import { welcomeSuggestions } from '../data/suggestions';
import { useLanguage } from '../App';
import { Shield } from 'lucide-react';

/**
 * ChatWindow — Main chat area with messages, welcome state, and loading.
 */
export default function ChatWindow({ messages, isLoading, onSuggestionClick }) {
  const messagesEndRef = useRef(null);
  const { t } = useLanguage();

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat Header */}
      <div className="h-16 px-6 border-b border-hairline bg-surface flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-gold flex-shrink-0" />
          <div>
            <h2 className="text-small font-bold text-ink font-body leading-tight">
              {t('chatTitle')}
            </h2>
            <p className="text-micro text-muted-text leading-tight">
              {t('chatDisclaimer')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-micro text-verified-green font-medium">
          <span className="status-dot-pulse w-2 h-2 rounded-full bg-verified-green inline-block" />
          <span className="hidden sm:inline">{t('chatStatus')}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5">
        {isEmpty ? (
          /* Welcome State */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-3xl mx-auto py-12 px-4">
            <div className="w-16 h-16 rounded-full bg-gold-soft/40 flex items-center justify-center mb-6">
              <Shield size={32} className="text-indigo" />
            </div>
            <h3 className="font-display text-h2-mobile md:text-h2 text-ink mb-4">
              {t('welcomeTitle')}
            </h3>
            <p className="text-body text-muted-text mb-8 max-w-xl">
              {t('welcomeSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
              {welcomeSuggestions.map((s) => (
                <SuggestionChip
                  key={s.id}
                  text={s.text}
                  onClick={onSuggestionClick}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isLoading && <LoadingIndicator text={t('loading')} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
