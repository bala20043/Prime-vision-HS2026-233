import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

/**
 * MetricCard — Evaluation metric display with animated count-up.
 * Numbers animate 0→target on first viewport entry per Section 3B Animation 8.
 */
export default function MetricCard({ label, value, suffix = '%', color = 'text-indigo', index = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (hasAnimated || shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Animate count-up
          const duration = 700;
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out
            setDisplayValue(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated, shouldReduceMotion]);

  return (
    <motion.div
      ref={ref}
      className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50 text-center"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      <p className={`font-display text-h2-mobile md:text-h2 font-bold ${color}`}>
        {displayValue}{suffix}
      </p>
      <p className="text-small text-muted-text mt-1">
        {label}
      </p>
    </motion.div>
  );
}
