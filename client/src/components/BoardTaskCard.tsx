import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronUp,
  CircleDotDashed,
  Clock3,
  ChevronDown,
  Edit2,
  Flag,
  Paperclip,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useDescriptionOverflow } from '../hooks/useDescriptionOverflow';

interface BoardTaskCardProps {
  task: Task;
  statusTheme: {
    accentColor: string;
    borderColor: string;
    headerBg: string;
  };
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
}

const statusIcons: Record<TaskStatus, React.FC<{ className?: string }>> = {
  todo: CircleDotDashed,
  in_progress: Clock3,
  done: CheckCircle2,
};

const statusKeys: Record<TaskStatus, 'statusTodo' | 'statusInProgress' | 'statusCompleted'> = {
  todo: 'statusTodo',
  in_progress: 'statusInProgress',
  done: 'statusCompleted',
};

export const BoardTaskCard: React.FC<BoardTaskCardProps> = ({
  task,
  statusTheme,
  onEdit,
  onDelete,
  onDragStart,
}) => {
  const { t, language } = useLanguage();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { descriptionRef, hasMoreContent } = useDescriptionOverflow(task.description || '', isDescriptionExpanded);
  const StatusIcon = statusIcons[task.status];

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    : t('noDueDate');

  const formattedReminder = task.reminderAt
    ? new Date(task.reminderAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  const shortId = `Task-${task._id.slice(-3).toUpperCase()}`;
  const flagColorClass =
    task.priority === 'high'
      ? 'text-rose-500 fill-rose-500/20'
      : task.priority === 'medium'
        ? 'text-amber-500 fill-amber-500/20'
        : 'text-slate-400 fill-slate-400/20';

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, task._id)}
      className="group relative min-w-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-800 transition-all duration-200 cursor-grab active:cursor-grabbing"
      style={{ borderInlineStartWidth: 4, borderInlineStartColor: statusTheme.accentColor }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{shortId}</span>
          <h3 className={`mt-0.5 break-words [overflow-wrap:anywhere] text-sm font-bold leading-snug text-slate-900 dark:text-slate-100 ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Flag
            className={`w-4 h-4 me-1 ${flagColorClass}`}
            aria-label={t(task.priority === 'high' ? 'priorityHigh' : task.priority === 'medium' ? 'priorityMedium' : 'priorityLow')}
          />
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-800 transition"
            title={t('editTask')}
            aria-label={t('editTask')}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition"
            title={t('deleteTask')}
            aria-label={t('deleteTask')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {task.description && (
        <div className="min-w-0 overflow-hidden mb-3">
          <p ref={descriptionRef} className={`break-words [overflow-wrap:anywhere] whitespace-pre-wrap text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${isDescriptionExpanded ? 'max-h-36 overflow-y-auto overscroll-contain pe-2' : 'line-clamp-2'}`}>
            {task.description}
          </p>
          {(hasMoreContent || isDescriptionExpanded) && (
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded((value) => !value)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
              aria-label={isDescriptionExpanded ? t('showLess') : t('seeMore')}
            >
              <span>{isDescriptionExpanded ? t('showLess') : t('seeMore')}</span>
              {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <StatusIcon className="w-3.5 h-3.5" />
          {t(statusKeys[task.status])}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 capitalize">
          <Flag className={`w-3 h-3 ${flagColorClass}`} />
          {t(task.priority === 'high' ? 'priorityHigh' : task.priority === 'medium' ? 'priorityMedium' : 'priorityLow')}
        </span>
      </div>

      <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="w-3.5 h-3.5 shrink-0 text-purple-500" />
          <span>{formattedDate}</span>
        </div>
        {formattedReminder && (
          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>{formattedReminder}</span>
          </div>
        )}
        {!!task.attachments?.length && (
          <div className="flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 shrink-0 text-purple-500" />
            <span>{task.attachments.length} {t('attachmentsLabel').toLowerCase()}</span>
          </div>
        )}
      </div>
    </article>
  );
};
