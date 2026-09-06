'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">ADRConnect</span>
          <span>&bull;</span>
          <span>{t('footer.unit', 'District Maternal Hospital Pharmacovigilance Unit')}</span>
        </div>
        <p>{t('footer.guidelines', 'Aligned with Indian Pharmacovigilance Programme (PvPI) & CDSCO Guidelines')}</p>
      </div>
    </footer>
  );
}
