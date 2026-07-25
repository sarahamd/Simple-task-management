import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { ColorSelect, SelectOption } from './ColorSelect';
import { useLanguage } from '../context/LanguageContext';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const createTaskFormSchema = (initialDueDate?: string) =>
  z.object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must not exceed 120 characters'),

    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, 'Description is required')
      .max(2000, 'Description must not exceed 2000 characters'),

    status: z.enum(['todo', 'in_progress', 'done'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be To Do, In Progress, or Done',
    }),

    priority: z.enum(['low', 'medium', 'high'], {
      required_error: 'Priority is required',
      invalid_type_error: 'Priority must be Low, Medium, or High',
    }),

    dueDate: z
      .string({
        required_error: 'Due date is required',
        invalid_type_error: 'Due date is required',
      })
      .min(1, 'Due date is required')
      .refine((value) => {
        const d = new Date(value);
        return !Number.isNaN(d.getTime());
      }, 'Please enter a valid due date')
      .refine((value) => {
        if (initialDueDate && value === initialDueDate) {
          return true;
        }
        const parts = value.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return date >= startOfToday();
        }
        const d = new Date(value);
        return d >= startOfToday();
      }, 'Due date cannot be in the past'),
  });

export type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { t } = useLanguage();
  const isEditing = !!(initialData && initialData._id);

  const initialDueDateStr = initialData?.dueDate
    ? new Date(initialData.dueDate).toISOString().substring(0, 10)
    : '';

  const statusOptions: SelectOption[] = [
    { value: 'todo', label: t('statusTodo'), colorDot: 'bg-amber-500' },
    { value: 'in_progress', label: t('statusInProgress'), colorDot: 'bg-blue-600' },
    { value: 'done', label: t('statusCompleted'), colorDot: 'bg-emerald-600' },
  ];

  const priorityOptions: SelectOption[] = [
    { value: 'low', label: t('priorityLow'), colorDot: 'bg-slate-400' },
    { value: 'medium', label: t('priorityMedium'), colorDot: 'bg-indigo-400' },
    { value: 'high', label: t('priorityHigh'), colorDot: 'bg-rose-400' },
  ];

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(createTaskFormSchema(initialDueDateStr)),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.dueDate
        ? new Date(initialData.dueDate).toISOString().substring(0, 10)
        : '';

      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        status: (['todo', 'in_progress', 'done'].includes(initialData.status) ? initialData.status : 'todo') as TaskStatus,
        priority: (['low', 'medium', 'high'].includes(initialData.priority) ? initialData.priority : 'medium') as TaskPriority,
        dueDate: formattedDate,
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
      });
    }
  }, [initialData, reset, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors || error?.response?.data?.error?.details;
      if (Array.isArray(apiErrors)) {
        apiErrors.forEach((err: { field: string; message: string }) => {
          if (err.field && err.message) {
            setError(err.field as keyof TaskFormData, {
              type: 'manual',
              message: err.message,
            });
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 sm:top-6 sm:right-6 sm:rtl:right-auto sm:rtl:left-6 p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 pr-8 rtl:pr-0 rtl:pl-8">
          {isEditing ? t('editTaskHeader') : t('createNewTask')}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4" noValidate>
          {/* Title Field */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('taskTitleLabel')}
            </label>
            <input
              id="task-title"
              {...register('title')}
              type="text"
              placeholder={t('titlePlaceholder')}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={`w-full bg-white dark:bg-slate-800/80 border ${
                errors.title ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-purple-500/20'
              } focus:ring-2 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition duration-150`}
            />
            {errors.title && (
              <p id="title-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('descriptionLabel')}
            </label>
            <textarea
              id="task-description"
              {...register('description')}
              rows={3}
              placeholder={t('descriptionPlaceholder')}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={`w-full bg-white dark:bg-slate-800/80 border ${
                errors.description ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-purple-500/20'
              } focus:ring-2 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition duration-150 resize-none`}
            />
            {errors.description && (
              <p id="description-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status & Priority Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <ColorSelect
                    label={t('statusLabel')}
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    id="status"
                    name="status"
                  />
                )}
              />
              {errors.status && (
                <p id="status-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                  {errors.status.message}
                </p>
              )}
            </div>

            <div>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <ColorSelect
                    label={t('priorityLabel')}
                    options={priorityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    id="priority"
                    name="priority"
                  />
                )}
              />
              {errors.priority && (
                <p id="priority-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                  {errors.priority.message}
                </p>
              )}
            </div>
          </div>

          {/* Due Date Field */}
          <div>
            <label htmlFor="task-due-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {t('dueDateLabel')}
            </label>
            <input
              id="task-due-date"
              {...register('dueDate')}
              type="date"
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
              className={`w-full bg-white dark:bg-slate-800/80 border ${
                errors.dueDate ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-purple-500/20'
              } focus:ring-2 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition duration-150 cursor-pointer dark:[color-scheme:dark]`}
            />
            {errors.dueDate && (
              <p id="dueDate-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3.5 border-t border-slate-200 dark:border-slate-800 mt-5 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? t('saveChanges') : t('createTaskBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
