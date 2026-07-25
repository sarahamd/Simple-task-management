import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { t } = useLanguage();
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('page')} <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> {t('of')}{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({total} {t('totalTasks')})
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          aria-label={t('prevPage')}
          title={t('prevPage')}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-xl text-xs font-medium border transition ${
              pageNum === page
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                : 'bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 disabled:opacity-40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          aria-label={t('nextPage')}
          title={t('nextPage')}
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
