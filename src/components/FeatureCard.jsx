import { motion } from 'framer-motion';

/**
 * FeatureCard — Trust section card with icon, title, and description.
 * Scroll-triggered reveal animation (Section 3B, Animation 2).
 */
export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      className="bg-surface rounded-card p-8 shadow-sm border border-hairline/60
                 hover:-translate-y-1 hover:shadow-card transition-all duration-base cursor-default"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-gold-soft/50 flex items-center justify-center mb-5">
        {Icon && <Icon size={26} className="text-indigo" />}
      </div>

      {/* Title */}
      <h3 className="font-display text-h3 text-ink mb-3 font-bold">
        {title}
      </h3>

      {/* Description */}
      <p className="text-body text-muted-text leading-relaxed text-lg">
        {description}
      </p>
    </motion.div>
  );
}
