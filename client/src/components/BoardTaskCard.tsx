import React from 'react';
import { Task } from '../types';
import { Flag, CheckSquare, Paperclip, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

export const BoardTaskCard: React.FC<BoardTaskCardProps> = ({
  task,
  statusTheme,
  onEdit,
  onDelete,
  onDragStart,
}) => {
  const { t } = useLanguage();

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    : t('noDueDate');

  // Format task ID for display like Task-101
  const shortId = `Task-${task._id.slice(-3).toUpperCase()}`;

  // Priority Flag Color
  const flagColorClass =
    task.priority === 'high'
      ? 'text-red-500 fill-red-500/20'
      : task.priority === 'medium'
      ? 'text-amber-500 fill-amber-500/20'
      : 'text-slate-400 fill-slate-400/20';

  // Deterministic user avatar color
  const avatarColors = [
    'bg-sky-500 text-white',
    'bg-amber-600 text-white',
    'bg-indigo-600 text-white',
    'bg-rose-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
  ];
  const charCodeSum = task.owner ? task.owner.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const avatarBg = avatarColors[charCodeSum % avatarColors.length];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      className={`group relative bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm hover:shadow-md border-t-4 transition-all duration-200 cursor-grab active:cursor-grabbing border-slate-200 dark:border-slate-800`}
      style={{ borderTopColor: statusTheme.accentColor }}
    >
      {/* Top Section: Title & Flag & Quick Action buttons */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate">
          {task.title}
        </h3>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <Flag className={`w-4 h-4 ${flagColorClass}`} />
          
          {/* Quick Edit/Delete on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={t('editTask')}
              aria-label={t('editTask')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={t('deleteTask')}
              aria-label={t('deleteTask')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Description preview if present */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Middle Section: Avatar & Indicators */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* User avatar */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${avatarBg}`}>
            {task.title ? task.title.charAt(0).toUpperCase() : 'U'}
          </div>
          {/* Task ID tag */}
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {shortId}
          </span>
        </div>

        {/* Status badges: checklist, attachments, comments */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            <CheckSquare className="w-3 h-3 text-sky-500" />
            01
          </span>
          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            <Paperclip className="w-3 h-3 text-sky-500" />
            01
          </span>
          <span className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
            <MessageSquare className="w-3 h-3 text-sky-500" />
            02
          </span>
        </div>
      </div>

      {/* Bottom Section: Color bars on left & Due Date on right */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Color indicator bars */}
        <div className="flex items-center gap-1">
          <span className="w-4 h-1 rounded-full bg-lime-500"></span>
          <span className="w-4 h-1 rounded-full bg-sky-400"></span>
          <span className="w-4 h-1 rounded-full bg-amber-700"></span>
        </div>

        {/* Red due date text */}
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tracking-tight">
          {formattedDate}
        </span>
      </div>
    </div>
  );
};
