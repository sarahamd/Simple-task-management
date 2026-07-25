import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Calendar, Edit3, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TranslationKeys } from '../i18n/translations';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { translationKey: TranslationKeys; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }> = {
  todo: {
    translationKey: 'statusTodo',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  in_progress: {
    translationKey: 'statusInProgress',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
    icon: AlertTriangle,
  },
  done: {
    translationKey: 'statusCompleted',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
};

const priorityConfig: Record<TaskPriority, { translationKey: TranslationKeys; bg: string; text: string; border: string }> = {
  low: { translationKey: 'priorityLow', bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
  medium: { translationKey: 'priorityMedium', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  high: { translationKey: 'priorityHigh', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const { t, language } = useLanguage();
  const status = statusConfig[task.status] || statusConfig.todo;
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-sm dark:shadow-lg transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <button
            onClick={() => onStatusToggle(task)}
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${status.bg} ${status.text} ${status.border} hover:opacity-80 transition cursor-pointer`}
            title={t('toggleStatus')}
          >
            <StatusIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{t(status.translationKey)}</span>
          </button>

          <span className={`px-2 py-0.5 sm:px-2.5 rounded-full text-[11px] sm:text-xs font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}>
            {t(priority.translationKey)}
          </span>
        </div>

        <h3 className={`text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-2">
        {formattedDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <span>{t('noDueDate')}</span>
        )}

        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-200">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition"
            title={t('editTask')}
            aria-label={t('editTask')}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
            title={t('deleteTask')}
            aria-label={t('deleteTask')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
