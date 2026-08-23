import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

/**
 * EvaluationTable — Test results table with status badges.
 * Shows question, expected type, system result, and status.
 */
export default function EvaluationTable({ results, isLoading = false }) {
  if (!results || results.length === 0) return null;

  const getStatusBadge = (status, expectedType) => {
    if (status === 'correct') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill
                         bg-verified-green/10 text-verified-green text-micro font-medium">
          <CheckCircle size={12} />
          Correct
        </span>
      );
    }
    if (status === 'incorrect') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill
                         bg-error-rust/10 text-error-rust text-micro font-medium">
          <XCircle size={12} />
          Incorrect
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill
                       bg-unknown-slate/10 text-unknown-slate text-micro font-medium">
        <HelpCircle size={12} />
        Unknown
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const isKnown = type === 'Known';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-pill text-micro font-medium
                        ${isKnown
                          ? 'bg-verified-green/10 text-verified-green'
                          : 'bg-unknown-slate/10 text-unknown-slate'
                        }`}>
        {type}
      </span>
    );
  };

  return (
    <motion.div
      className="bg-surface rounded-card shadow-sm border border-hairline/50 overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-hairline bg-parchment/50">
              <th className="px-4 py-3 text-micro text-muted-text font-medium uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-micro text-muted-text font-medium uppercase tracking-wider">Question</th>
              <th className="px-4 py-3 text-micro text-muted-text font-medium uppercase tracking-wider">Expected</th>
              <th className="px-4 py-3 text-micro text-muted-text font-medium uppercase tracking-wider">Result</th>
              <th className="px-4 py-3 text-micro text-muted-text font-medium uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, i) => (
              <tr key={i} className="border-b border-hairline/50 last:border-0 hover:bg-parchment/30 transition-colors">
                <td className="px-4 py-3 font-mono text-micro text-muted-text">
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td className="px-4 py-3 text-small text-ink max-w-xs">
                  {row.question}
                </td>
                <td className="px-4 py-3">
                  {getTypeBadge(row.expectedType)}
                </td>
                <td className="px-4 py-3 font-mono text-small text-ink">
                  {row.systemResult || '—'}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(row.status, row.expectedType)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
