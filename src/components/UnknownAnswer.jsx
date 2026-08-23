import { motion, useReducedMotion } from 'framer-motion';
import VerificationSeal from './VerificationSeal';
import { useLanguage } from '../App';

/**
 * UnknownAnswer — Card for "information not found" state.
 * Uses --color-unknown-slate, never --color-error-rust.
 * Shows outlined, unfilled slate Verification Seal with calm fade.
 */
export default function UnknownAnswer() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-surface rounded-card p-5 border border-unknown-slate/20 shadow-sm"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.1 }
          : { duration: 0.26, delay: 0.06, ease: 'easeOut' }
      }
    >
      {/* Header with seal */}
      <div className="flex items-center gap-3 mb-3">
        <VerificationSeal state="unknown" size="md" />
        <div>
          <span className="text-small font-medium text-unknown-slate uppercase tracking-wider">
            {t('infoNotFound')}
          </span>
        </div>
      </div>

      <hr className="hairline mb-3" />

      {/* Main message */}
      <p className="text-body text-ink font-medium mb-2">
        {t('unknownAnswer')}
      </p>

      {/* Explanation */}
      <p className="text-small text-muted-text">
        {t('unknownExplanation')}
      </p>
    </motion.div>
  );
}
