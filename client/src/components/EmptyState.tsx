import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateTask: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onClearFilters, onCreateTask }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center my-8 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
        <ClipboardList className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-1">
        {hasFilters ? t('noMatchingTitle') : t('noTasksTitle')}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6">
        {hasFilters ? t('noMatchingSub') : t('noTasksSub')}
      </p>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 transition"
        >
          {t('clearAllFilters')}
        </button>
      ) : (
        <button
          onClick={onCreateTask}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          {t('createFirstTask')}
        </button>
      )}
    </div>
  );
};
