import { motion } from 'framer-motion';
import { MessageSquare, Search, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../App';
import VerificationSeal from '../components/VerificationSeal';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const steps = [
  { icon: MessageSquare, color: 'bg-indigo' },
  { icon: Search, color: 'bg-indigo' },
  { icon: ShieldCheck, color: 'bg-gold' },
  { icon: CheckCircle, color: 'bg-verified-green' },
];

export default function About() {
  const { t } = useLanguage();

  const stepData = [
    { title: t('step1Title'), desc: t('step1Desc') },
    { title: t('step2Title'), desc: t('step2Desc') },
    { title: t('step3Title'), desc: t('step3Desc') },
    { title: t('step4Title'), desc: t('step4Desc') },
  ];

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
        <div className="text-center mb-16">
          <h1 className="font-display text-h2-mobile md:text-h2 text-ink mb-3">
            {t('aboutTitle')}
          </h1>
          <p className="text-body text-muted-text max-w-xl mx-auto">
            {t('aboutSubtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl lg:max-w-5xl mx-auto mb-16">
          {stepData.map((step, i) => {
            const StepIcon = steps[i].icon;
            return (
              <motion.div
                key={i}
                className="flex gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                {/* Step number + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full ${steps[i].color} text-parchment
                                  flex items-center justify-center flex-shrink-0`}>
                    <StepIcon size={22} />
                  </div>
                  {i < stepData.length - 1 && (
                    <div className="w-px flex-1 bg-hairline mt-2" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-micro text-muted-text">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-h3-mobile md:text-h3 text-ink">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-body text-muted-text">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Important Statement */}
        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="bg-surface rounded-card p-8 shadow-card border border-hairline/50 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle size={28} className="text-gold" />
            </div>
            <p className="font-display text-h3-mobile md:text-h3 text-ink italic leading-relaxed">
              "{t('importantNote')}"
            </p>
          </div>
        </motion.div>

        {/* Answer States Explanation */}
        <div className="max-w-5xl lg:max-w-6xl mx-auto">
          <motion.h2
            className="font-display text-h3-mobile md:text-h3 text-ink mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Understanding Response States
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Supported */}
            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <VerificationSeal state="supported" size="sm" />
                <span className="text-small font-medium text-verified-green uppercase tracking-wider">
                  {t('supported')}
                </span>
              </div>
              <hr className="hairline mb-3" />
              <p className="text-small text-muted-text">
                Answer found in the knowledge base. The gold seal confirms the information is verified.
              </p>
            </motion.div>

            {/* Unsupported */}
            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.08 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <VerificationSeal state="unknown" size="sm" />
                <span className="text-small font-medium text-unknown-slate uppercase tracking-wider">
                  Not Found
                </span>
              </div>
              <hr className="hairline mb-3" />
              <p className="text-small text-muted-text">
                Information not stated in the provided documents. The outlined seal shows the system knows its limits.
              </p>
            </motion.div>

            {/* Error */}
            <motion.div
              className="bg-surface rounded-card p-5 shadow-sm border border-hairline/50"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.16 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle size={20} className="text-error-rust" />
                <span className="text-small font-medium text-error-rust uppercase tracking-wider">
                  System Error
                </span>
              </div>
              <hr className="hairline mb-3" />
              <p className="text-small text-muted-text">
                The service could not be reached. This is a genuine system error, distinct from unknown answers.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
