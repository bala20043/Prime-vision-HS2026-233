import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import { useLanguage } from '../App';
import { BookOpen, ShieldCheck, MessageCircle, FileSearch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: BookOpen, title: t('trust1Title'), description: t('trust1Desc') },
    { icon: ShieldCheck, title: t('trust2Title'), description: t('trust2Desc') },
    { icon: MessageCircle, title: t('trust3Title'), description: t('trust3Desc') },
    { icon: FileSearch, title: t('trust4Title'), description: t('trust4Desc') },
  ];

  const steps = [
    { num: '01', title: t('step1Title'), desc: t('step1Desc') },
    { num: '02', title: t('step2Title'), desc: t('step2Desc') },
    { num: '03', title: t('step3Title'), desc: t('step3Desc') },
    { num: '04', title: t('step4Title'), desc: t('step4Desc') },
  ];

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      <Hero />

      {/* Trust Section */}
      <section className="py-20 md:py-28 bg-parchment">
        <div className="page-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-h2 text-ink mb-4 font-bold">
              {t('trustTitle')}
            </h2>
            <p className="text-muted-text max-w-3xl mx-auto text-xl md:text-2xl leading-relaxed">
              Designed to provide accurate, verifiable answers from the official college knowledge base.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="page-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-h2 text-ink mb-4 font-bold">
              {t('aboutTitle')}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="text-center bg-parchment/50 p-8 rounded-card border border-hairline shadow-sm"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div className="w-16 h-16 rounded-full bg-indigo text-parchment
                                flex items-center justify-center mx-auto mb-5
                                font-display text-2xl font-bold shadow-sm">
                  {step.num}
                </div>
                <h3 className="font-display text-2xl md:text-3xl text-ink mb-3 font-bold">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-text leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Important Note */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <p className="text-ink font-display font-semibold italic max-w-3xl mx-auto
                          border-l-4 border-gold pl-6 text-left text-xl md:text-2xl leading-relaxed bg-parchment/60 py-5 pr-5 rounded-r">
              {t('importantNote')}
            </p>
          </motion.div>

          {/* Auth & Start CTAs */}
          <div className="text-center mt-14 flex flex-wrap justify-center gap-5">
            <Link
              to="/assistant"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-indigo text-parchment
                         font-body font-bold text-2xl rounded-card min-h-[64px]
                         hover:bg-indigo-deep transition-all duration-fast
                         active:scale-[1.02] shadow-elevated no-underline hover:text-parchment"
            >
              {t('heroStart')}
              <ArrowRight size={26} />
            </Link>

            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-3 px-9 py-5 bg-gold text-ink
                             font-body font-bold text-2xl rounded-card min-h-[64px]
                             hover:bg-gold/90 transition-all duration-fast
                             active:scale-[1.02] shadow-card no-underline"
                >
                  <UserPlus size={24} />
                  Create Account
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-parchment text-ink
                             font-body font-bold text-2xl rounded-card min-h-[64px]
                             border-2 border-hairline hover:border-indigo
                             transition-all duration-fast no-underline shadow-sm"
                >
                  <LogIn size={24} className="text-indigo" />
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-parchment py-8">
        <div className="page-container text-center">
          <p className="font-display text-lg font-semibold mb-2">CollegeAI</p>
          <p className="text-micro text-parchment/60">
            AI College Knowledge Assistant · ABC Institute of Technology · 2026–2027
          </p>
          <p className="text-micro text-parchment/40 mt-1">
            Ask. Understand. Know.
          </p>
        </div>
      </footer>
    </motion.main>
  );
}
