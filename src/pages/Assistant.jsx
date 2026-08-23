import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import Sidebar from '../components/Sidebar';
import SuggestionChip from '../components/SuggestionChip';
import { askQuestion } from '../services/api';
import { popularSuggestions } from '../data/suggestions';
import { useLanguage } from '../App';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const { t, language } = useLanguage();

  const handleSend = useCallback(async (question) => {
    // Add user message
    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askQuestion(question, language);

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        type: response.type,
        source: response.source,
        evidence: response.evidence,
        confidence: response.confidence,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Add to conversations sidebar
      setConversations(prev => {
        const title = question.length > 30 ? question.substring(0, 30) + '…' : question;
        const now = new Date();
        const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // Avoid duplicates
        if (prev.some(c => c.title === title)) return prev;
        return [{ title, timestamp }, ...prev].slice(0, 10);
      });
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: t('networkError'),
        type: 'error',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleClear = () => {
    setMessages([]);
    setConversations([]);
  };

  const handleSuggestionClick = (text) => {
    handleSend(text);
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col"
      style={{ height: 'calc(100vh - 80px)' }}
    >
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar
          conversations={conversations}
          onNewChat={handleNewChat}
          onClear={handleClear}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-parchment">
          {/* Chat Window */}
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSuggestionClick={handleSuggestionClick}
          />

          {/* Popular Questions (shown when messages exist) */}
          {messages.length > 0 && (
            <div className="px-6 py-3 border-t border-hairline bg-surface/80">
              <p className="text-small text-muted-text mb-2 font-medium">
                {t('popularQuestions')}
              </p>
              <div className="flex flex-wrap gap-2 max-w-5xl xl:max-w-6xl mx-auto">
                {popularSuggestions.map((s) => (
                  <SuggestionChip
                    key={s.id}
                    text={s.text}
                    onClick={handleSuggestionClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Chat Input */}
          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </motion.main>
  );
}
