import { motion, useReducedMotion } from 'framer-motion';
import VerificationSeal from './VerificationSeal';
import SourceCard from './SourceCard';
import UnknownAnswer from './UnknownAnswer';

/**
 * ChatMessage — Renders user or assistant messages with appropriate styling.
 *
 * User messages: right-aligned, indigo bg, slides from right.
 * Assistant messages: left-aligned, answer card with source/seal.
 */
export default function ChatMessage({ message }) {
  const shouldReduceMotion = useReducedMotion();
  const { role, content, type, source, evidence } = message;

  // User message
  if (role === 'user') {
    return (
      <motion.div
        className="flex justify-end mb-4"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.1 }
            : { duration: 0.22, ease: 'easeOut' }
        }
      >
        <div className="bg-indigo text-parchment px-5 py-3.5 rounded-card rounded-br-sm
                        text-body max-w-xl lg:max-w-2xl xl:max-w-3xl shadow-sm">
          {content}
        </div>
      </motion.div>
    );
  }

  // Assistant: Unknown answer
  if (type === 'unknown') {
    return (
      <div className="flex justify-start mb-4 w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <UnknownAnswer />
      </div>
    );
  }

  // Assistant: Known / Supported answer
  return (
    <motion.div
      className="flex justify-start mb-4"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.1 }
          : { duration: 0.26, delay: 0.06, ease: 'easeOut' }
      }
    >
      <div className="bg-surface rounded-card p-6 border border-hairline/50 shadow-sm w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {/* Supported header */}
        <div className="flex items-center gap-2 mb-3">
          <VerificationSeal state="supported" size="sm" />
          <span className="text-micro font-medium text-verified-green uppercase tracking-wider">
            Supported
          </span>
        </div>

        <hr className="hairline mb-3" />

        {/* Answer text — render markdown bold */}
        <div
          className="text-body text-ink leading-relaxed prose-strong:font-semibold"
          dangerouslySetInnerHTML={{
            __html: content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }}
        />

        {/* Source & Evidence */}
        <SourceCard source={source} evidence={evidence} />
      </div>
    </motion.div>
  );
}
