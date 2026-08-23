import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, BarChart3, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import EvaluationTable from '../components/EvaluationTable';
import { getEvaluationResults, runEvaluation, evaluationTestCases } from '../services/api';
import { useLanguage } from '../App';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/**
 * ProgressBar — Animated bar that fills on viewport entry.
 */
function ProgressBar({ value, color = 'bg-verified-green', label }) {
  const [width, setWidth] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setWidth(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          // Animate after a brief delay
          setTimeout(() => setWidth(value), 100);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated, shouldReduceMotion]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-small text-ink font-medium">{label}</span>
        <span className="font-mono text-small text-ink font-bold">{value}%</span>
      </div>
      <div className="h-3 bg-parchment rounded-pill overflow-hidden border border-hairline/50">
        <div
          className={`h-full rounded-pill ${color} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function Evaluation() {
  const [metrics, setMetrics] = useState(null);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Load initial metrics
    getEvaluationResults().then(res => {
      if (res.success) setMetrics(res.metrics);
    });
  }, []);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    try {
      const res = await runEvaluation();
      if (res.success) setResults(res.results);
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-parchment"
    >
      <div className="page-container py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-h2-mobile md:text-h2 text-ink mb-3">
            {t('evalTitle')}
          </h1>
          <p className="text-body text-muted-text max-w-2xl mx-auto">
            {t('evalSubtitle')}
          </p>
        </div>

        {/* Summary Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-micro text-muted-text font-medium uppercase tracking-wider mb-1">
                {t('knownQuestions')}
              </p>
              <p className="font-display text-h2-mobile text-verified-green font-bold">
                {metrics.knownTotal}
              </p>
            </motion.div>

            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.08 }}
            >
              <p className="text-micro text-muted-text font-medium uppercase tracking-wider mb-1">
                {t('unknownQuestions')}
              </p>
              <p className="font-display text-h2-mobile text-unknown-slate font-bold">
                {metrics.unknownTotal}
              </p>
            </motion.div>

            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.16 }}
            >
              <p className="text-micro text-muted-text font-medium uppercase tracking-wider mb-1">
                {t('total')}
              </p>
              <p className="font-display text-h2-mobile text-ink font-bold">
                {metrics.totalQuestions}
              </p>
            </motion.div>

            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.24 }}
            >
              <p className="text-micro text-muted-text font-medium uppercase tracking-wider mb-1">
                {t('targetAccuracy')}
              </p>
              <p className="font-display text-h2-mobile text-gold font-bold">
                100%
              </p>
            </motion.div>
          </div>
        )}

        {/* Evaluation Results — Progress Bars */}
        {metrics && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div
              className="bg-surface rounded-card p-6 shadow-sm border border-hairline/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-display text-h3-mobile text-ink mb-1">
                {t('knownQuestions')}
              </h3>
              <p className="text-small text-muted-text mb-4">
                {metrics.knownCorrect} / {metrics.knownTotal} {t('knownResult')}
              </p>
              <ProgressBar
                value={metrics.knownAccuracy}
                color="bg-verified-green"
                label={t('knownAccuracy')}
              />
            </motion.div>

            <motion.div
              className="bg-surface rounded-card p-6 shadow-sm border border-hairline/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.08 }}
            >
              <h3 className="font-display text-h3-mobile text-ink mb-1">
                {t('unknownQuestions')}
              </h3>
              <p className="text-small text-muted-text mb-4">
                {metrics.unknownCorrect} / {metrics.unknownTotal} {t('unknownResult')}
              </p>
              <ProgressBar
                value={metrics.unknownRejection}
                color="bg-indigo"
                label={t('unknownRejection')}
              />
            </motion.div>
          </div>
        )}

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <MetricCard label={t('answerAccuracy')} value={metrics.answerAccuracy} color="text-verified-green" index={0} />
            <MetricCard label={t('knownAccuracy')} value={metrics.knownAccuracy} color="text-indigo" index={1} />
            <MetricCard label={t('unknownRejection')} value={metrics.unknownRejection} color="text-indigo" index={2} />
            <MetricCard label={t('unsupportedRate')} value={metrics.unsupportedRate} color="text-verified-green" index={3} />
          </div>
        )}

        {/* Run Evaluation Button */}
        <div className="text-center mb-10">
          <button
            onClick={handleRunEvaluation}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo text-parchment
                       font-body font-medium rounded-button
                       hover:bg-indigo-deep transition-all duration-fast
                       active:scale-[1.02] shadow-sm hover:shadow-card
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <span className="flex gap-1">
                  <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
                  <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
                  <span className="loading-dot w-1.5 h-1.5 rounded-full bg-parchment inline-block" />
                </span>
                Running...
              </>
            ) : (
              <>
                <Play size={18} />
                {t('runEvaluation')}
              </>
            )}
          </button>
        </div>

        {/* Results Table */}
        {results && (
          <div>
            <h2 className="font-display text-h3-mobile md:text-h3 text-ink mb-6">
              Test Results
            </h2>
            <EvaluationTable results={results} />
          </div>
        )}
      </div>
    </motion.main>
  );
}
