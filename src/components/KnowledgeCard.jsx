import { motion } from 'framer-motion';
import { iconMap } from '../data/knowledge';

/**
 * KnowledgeCard — Displays a knowledge base category with icon and summary.
 * Scroll-triggered reveal with staggered delay.
 */
export default function KnowledgeCard({ category, index = 0, onClick }) {
  const Icon = iconMap[category.icon];

  return (
    <motion.button
      onClick={() => onClick && onClick(category)}
      className="text-left w-full bg-surface rounded-card p-7 shadow-sm border border-hairline/60
                 hover:-translate-y-1 hover:shadow-card transition-all duration-base
                 focus-visible:ring-2 focus-visible:ring-gold"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      {/* Icon + Category Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-full bg-gold-soft/50 flex items-center justify-center">
          {Icon && <Icon size={24} className="text-indigo" />}
        </div>
        <span className="text-small text-muted-text bg-parchment px-2.5 py-1 rounded-pill font-mono">
          {category.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-2xl text-ink mb-2 font-bold">
        {category.title}
      </h3>

      {/* Summary */}
      <p className="text-body text-muted-text leading-relaxed text-lg">
        {category.summary}
      </p>

      {/* Hairline + Source */}
      <div className="mt-4 pt-3.5 border-t border-hairline">
        <p className="font-mono text-small text-muted-text/70">
          {category.source} · {category.year}
        </p>
      </div>
    </motion.button>
  );
}
