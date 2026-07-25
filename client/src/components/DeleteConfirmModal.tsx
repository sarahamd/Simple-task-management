import React from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import { Task } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  task?: Task | null;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task,
  isDeleting = false,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 sm:top-5 sm:right-5 sm:rtl:right-auto sm:rtl:left-5 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Warning Badge / Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
          <Trash2 className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5 sm:mb-2">
          {t('deleteModalTitle')}
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          {t('deleteConfirmPrompt')}
        </p>

        {task && (
          <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 mb-4 text-left rtl:text-right">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">
              {t('taskTitleHeading')}
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {t('deleteWarningText')}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('deletingBtn')}
              </>
            ) : (
              t('deleteTaskBtn')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
