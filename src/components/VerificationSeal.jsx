import { motion, useReducedMotion } from 'framer-motion';

/**
 * VerificationSeal — Signature visual element.
 * Single reusable component for both "supported" (gold filled, stamp animation)
 * and "unknown" (slate outlined, calm fade) states.
 *
 * @param {'supported'|'unknown'} state
 * @param {string} [size='md'] — 'sm' | 'md' | 'lg'
 */
export default function VerificationSeal({ state = 'supported', size = 'md' }) {
  const shouldReduceMotion = useReducedMotion();

  const sizes = {
    sm: { outer: 28, inner: 20, stroke: 1.5, check: 10 },
    md: { outer: 40, inner: 30, stroke: 2, check: 14 },
    lg: { outer: 56, inner: 42, stroke: 2.5, check: 18 },
  };
  const s = sizes[size] || sizes.md;

  const isSupported = state === 'supported';
  const fillColor = isSupported ? '#B8912F' : 'transparent';
  const strokeColor = isSupported ? '#B8912F' : '#5B6478';
  const checkColor = isSupported ? '#FFFFFF' : '#5B6478';
  const ringColor = isSupported ? '#B8912F' : '#5B6478';

  // Stamp animation for supported (bounce); calm fade for unknown
  const sealVariants = {
    hidden: {
      opacity: 0,
      scale: isSupported ? 1.4 : 1,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0.1 }
        : isSupported
          ? { duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }
          : { duration: 0.2, ease: 'easeOut' },
    },
  };

  // Settle effect for supported state
  const settleVariants = {
    hidden: { y: 0 },
    visible: isSupported && !shouldReduceMotion
      ? { y: [0, 1, 0], transition: { duration: 0.06, delay: 0.18 } }
      : {},
  };

  const circumference = 2 * Math.PI * (s.outer / 2 - s.stroke);

  return (
    <motion.div
      className="inline-flex items-center justify-center"
      variants={settleVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.svg
        width={s.outer}
        height={s.outer}
        viewBox={`0 0 ${s.outer} ${s.outer}`}
        variants={sealVariants}
        initial="hidden"
        animate="visible"
        aria-label={isSupported ? 'Verified — Supported by knowledge base' : 'Not verified — Information not found'}
        role="img"
      >
        {/* Outer ring */}
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={s.outer / 2 - s.stroke}
          fill="none"
          stroke={ringColor}
          strokeWidth={s.stroke * 0.6}
          opacity={0.4}
        />

        {/* Animated ring draw (supported only) */}
        {isSupported && !shouldReduceMotion && (
          <circle
            cx={s.outer / 2}
            cy={s.outer / 2}
            r={s.outer / 2 - s.stroke}
            fill="none"
            stroke={ringColor}
            strokeWidth={s.stroke * 0.6}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className="seal-ring-draw"
            style={{ animationDelay: '220ms' }}
            strokeLinecap="round"
          />
        )}

        {/* Inner double ring */}
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={s.inner / 2 + 1}
          fill="none"
          stroke={strokeColor}
          strokeWidth={s.stroke * 0.5}
          opacity={0.6}
        />

        {/* Main circle */}
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={s.inner / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={s.stroke}
        />

        {/* Check mark */}
        <polyline
          points={`${s.outer / 2 - s.check / 3} ${s.outer / 2} ${s.outer / 2 - s.check / 8} ${s.outer / 2 + s.check / 4} ${s.outer / 2 + s.check / 3} ${s.outer / 2 - s.check / 4}`}
          fill="none"
          stroke={checkColor}
          strokeWidth={s.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}
