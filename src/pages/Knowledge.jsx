import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import KnowledgeCard from '../components/KnowledgeCard';
import { knowledgeCategories, iconMap } from '../data/knowledge';
import { useLanguage } from '../App';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { t } = useLanguage();

  const filteredCategories = knowledgeCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-parchment"
    >
      <div className="page-container py-12 md:py-20">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-h2-mobile md:text-h2 text-ink mb-3">
            {t('knowledgeTitle')}
          </h1>
          <p className="text-body text-muted-text max-w-xl mx-auto">
            {t('knowledgeSubtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchKnowledge')}
            className="w-full pl-12 pr-10 py-3.5 bg-surface border border-hairline rounded-card
                       text-body text-ink font-body placeholder:text-muted-text/60
                       focus:outline-none focus:border-indigo focus:shadow-sm
                       transition-all duration-fast"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink
                         transition-colors p-1"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selectedCategory ? (
            /* Source Explorer Detail View */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl lg:max-w-5xl mx-auto"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-indigo text-small font-medium mb-6
                           hover:text-indigo-deep transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Knowledge Base
              </button>

              <div className="bg-surface rounded-card shadow-card border border-hairline/50 overflow-hidden">
                {/* Registry header */}
                <div className="bg-ink text-parchment px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const Icon = iconMap[selectedCategory.icon];
                      return Icon ? <Icon size={20} className="text-gold" /> : null;
                    })()}
                    <h2 className="font-display text-h3 font-semibold">
                      {selectedCategory.title}
                    </h2>
                  </div>
                  <span className="font-mono text-micro text-parchment/60">
                    REG-{selectedCategory.id.toUpperCase().slice(0, 4)}-001
                  </span>
                </div>

                {/* Metadata — ledger style */}
                <div className="px-6 py-4 space-y-0">
                  <div className="flex border-b border-hairline py-2.5">
                    <span className="text-small text-muted-text w-36 flex-shrink-0">{t('category')}</span>
                    <span className="text-small text-ink font-medium">{selectedCategory.category}</span>
                  </div>
                  <div className="flex border-b border-hairline py-2.5">
                    <span className="text-small text-muted-text w-36 flex-shrink-0">{t('source')}</span>
                    <span className="text-small text-ink font-medium">{selectedCategory.source}</span>
                  </div>
                  <div className="flex border-b border-hairline py-2.5">
                    <span className="text-small text-muted-text w-36 flex-shrink-0">{t('academicYear')}</span>
                    <span className="text-small text-ink font-medium">{selectedCategory.year}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-6 py-5">
                  <h3 className="text-micro text-muted-text font-medium uppercase tracking-wider mb-3">
                    Information
                  </h3>
                  <ul className="space-y-3">
                    {selectedCategory.details.map((detail, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-mono text-micro text-muted-text/50 mt-0.5 flex-shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-body text-ink leading-relaxed">{detail}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence quote */}
                <div className="px-6 py-4 bg-parchment border-t border-hairline">
                  <p className="text-micro text-muted-text font-medium uppercase tracking-wider mb-2">
                    Primary Evidence
                  </p>
                  <p className="font-mono text-small text-ink leading-relaxed tracking-wide">
                    "{selectedCategory.details[0]}"
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Category Grid */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filteredCategories.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-body text-muted-text">
                    No matching categories found.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredCategories.map((cat, i) => (
                    <KnowledgeCard
                      key={cat.id}
                      category={cat}
                      index={i}
                      onClick={setSelectedCategory}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
