import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Calendar, Edit3, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusToggle: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string; border: string; icon: React.FC<{ className?: string }> }> = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: AlertTriangle,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
};

const priorityConfig: Record<TaskPriority, { label: string; bg: string; text: string; border: string }> = {
  LOW: { label: 'Low', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  MEDIUM: { label: 'Medium', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  HIGH: { label: 'High', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const status = statusConfig[task.status] || statusConfig.PENDING;
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;
  const StatusIcon = status.icon;

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="group bg-slate-900/60 backdrop-blur-sm border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={() => onStatusToggle(task)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border} hover:opacity-80 transition`}
            title="Click to toggle status"
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{status.label}</span>
          </button>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priority.bg} ${priority.text} ${priority.border}`}>
            {priority.label}
          </span>
        </div>

        <h3 className={`text-base font-semibold text-slate-100 mb-2 leading-snug ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h3>

        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 mt-2">
        {formattedDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <span>No due date</span>
        )}

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition duration-200">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
