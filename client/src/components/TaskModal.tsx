import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Bell, Clock, AlertTriangle, CheckCircle2, Paperclip, FileText, Trash2, Download } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskAttachment } from '../types';
import { ColorSelect, SelectOption } from './ColorSelect';
import { useLanguage } from '../context/LanguageContext';
import { downloadTaskAttachment, formatFileSize } from '../utils/attachments';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const toLocalDateTimeValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
};

const toLocalDateValue = (value?: string | null) => toLocalDateTimeValue(value).slice(0, 10);
const toLocalTimeValue = (value?: string | null) => toLocalDateTimeValue(value).slice(11, 19) || '09:00:00';

type ReminderUnit = 'seconds' | 'minutes' | 'hours' | 'days';

const reminderUnitMs: Record<ReminderUnit, number> = {
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
};

const getReminderOffset = (dueDate?: string | null, reminderAt?: string | null) => {
  if (!dueDate || !reminderAt) return { enabled: false, amount: '15', unit: 'minutes' as ReminderUnit };
  const difference = new Date(dueDate).getTime() - new Date(reminderAt).getTime();
  if (!Number.isFinite(difference) || difference <= 0) {
    return { enabled: false, amount: '15', unit: 'minutes' as ReminderUnit };
  }

  const unit = (['days', 'hours', 'minutes', 'seconds'] as ReminderUnit[]).find(
    (candidate) => difference % reminderUnitMs[candidate] === 0
  ) || 'seconds';

  return {
    enabled: true,
    amount: String(Math.max(1, Math.round(difference / reminderUnitMs[unit]))),
    unit,
  };
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

    reminderAt: z
      .union([
        z.literal(''),
        z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), 'Please enter a valid reminder date'),
      ])
      .optional(),
  });

export type TaskFormData = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  reminderAt?: string;
  newAttachments?: File[];
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
  onRemoveAttachment?: (taskId: string, attachmentId: string) => Promise<void>;
}

const getDefaultDueDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return {
    date: toLocalDateValue(now.toISOString()),
    time: toLocalTimeValue(now.toISOString()),
  };
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onRemoveAttachment,
}) => {
  const { t } = useLanguage();
  const isEditing = !!(initialData && initialData._id);
  const [dueTime, setDueTime] = useState(() => getDefaultDueDateTime().time);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderAmount, setReminderAmount] = useState('15');
  const [reminderUnit, setReminderUnit] = useState<ReminderUnit>('minutes');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<TaskAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState('');

  const initialDueDateStr = toLocalDateValue(initialData?.dueDate);

  const statusOptions: SelectOption[] = [
    { value: 'todo', label: t('statusTodo'), colorDot: 'bg-amber-500', icon: <Clock className="w-4 h-4 text-amber-500" /> },
    { value: 'in_progress', label: t('statusInProgress'), colorDot: 'bg-purple-500', icon: <AlertTriangle className="w-4 h-4 text-purple-500" /> },
    { value: 'done', label: t('statusCompleted'), colorDot: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
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
      reminderAt: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = toLocalDateValue(initialData.dueDate);
      setDueTime(toLocalTimeValue(initialData.dueDate));
      const reminderOffset = getReminderOffset(initialData.dueDate, initialData.reminderAt);
      setReminderEnabled(reminderOffset.enabled);
      setReminderAmount(reminderOffset.amount);
      setReminderUnit(reminderOffset.unit);
      setSelectedFiles([]);
      setExistingAttachments(initialData.attachments || []);
      setAttachmentError('');

      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        status: (['todo', 'in_progress', 'done'].includes(initialData.status) ? initialData.status : 'todo') as TaskStatus,
        priority: (['low', 'medium', 'high'].includes(initialData.priority) ? initialData.priority : 'medium') as TaskPriority,
        dueDate: formattedDate,
        reminderAt: toLocalDateTimeValue(initialData.reminderAt),
      });
    } else {
      const futureDue = getDefaultDueDateTime();
      setDueTime(futureDue.time);
      setReminderEnabled(false);
      setReminderAmount('15');
      setReminderUnit('minutes');
      setSelectedFiles([]);
      setExistingAttachments([]);
      setAttachmentError('');
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        reminderAt: '',
      });
    }
  }, [initialData, reset, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      const dateParts = data.dueDate.split('-').map(Number);
      const timeParts = (dueTime || '12:00:00').split(':').map(Number);
      const dueDateObj = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
        timeParts[0] || 0,
        timeParts[1] || 0,
        timeParts[2] || 0
      );
      const originalDueTime = initialData?.dueDate ? new Date(initialData.dueDate).getTime() : null;
      const unchangedExistingDueTime = isEditing && originalDueTime !== null
        && Math.abs(dueDateObj.getTime() - originalDueTime) < 1_000;

      if (dueDateObj.getTime() <= Date.now() && !unchangedExistingDueTime) {
        setError('dueDate', { type: 'manual', message: t('dueDateTimePast') });
        return;
      }
      const dueDateWithTime = dueDateObj.toISOString();
      let reminderAt = '';

      if (reminderEnabled) {
        const amount = Number(reminderAmount);
        if (!Number.isFinite(amount) || amount <= 0) {
          setError('reminderAt', { type: 'manual', message: t('reminderAmountInvalid') });
          return;
        }
        const reminderMs = dueDateObj.getTime() - amount * reminderUnitMs[reminderUnit];
        if (reminderMs <= Date.now()) {
          setError('reminderAt', { type: 'manual', message: t('reminderFutureError') });
          return;
        }
        reminderAt = new Date(reminderMs).toISOString();
      }

      if (reminderAt && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      await onSubmit({
        ...data,
        dueDate: dueDateWithTime,
        reminderAt,
        newAttachments: selectedFiles,
      });
      onClose();
    } catch (error: unknown) {
      const apiError = error as {
        response?: {
          data?: {
            errors?: Array<{ field: string; message: string }>;
            error?: { details?: Array<{ field: string; message: string }> };
            message?: string;
          };
        };
      };
      const apiErrors = apiError.response?.data?.errors || apiError.response?.data?.error?.details;
      if (Array.isArray(apiErrors)) {
        apiErrors.forEach((err: { field: string; message: string }) => {
          if (err.field && err.message) {
            setError(err.field as keyof TaskFormData, {
              type: 'manual',
              message: err.message,
            });
          }
        });
      } else {
        setAttachmentError(apiError.response?.data?.message || t('taskSaveFailed'));
      }
    }
  };

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;
    const nextFiles = Array.from(files);
    if (nextFiles.some((file) => file.size > 5 * 1024 * 1024)) {
      setAttachmentError(t('attachmentTooLarge'));
      return;
    }
    if (existingAttachments.length + selectedFiles.length + nextFiles.length > 5) {
      setAttachmentError(t('attachmentLimit'));
      return;
    }
    setAttachmentError('');
    setSelectedFiles((current) => [...current, ...nextFiles]);
  };

  const handleRemoveExistingAttachment = async (attachmentId: string) => {
    if (!initialData?._id || !onRemoveAttachment) return;
    try {
      await onRemoveAttachment(initialData._id, attachmentId);
      setExistingAttachments((current) => current.filter((item) => item._id !== attachmentId));
    } catch {
      setAttachmentError(t('attachmentRemoveFailed'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-hidden p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative">
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
            <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
              <div>
                <label htmlFor="task-due-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('dueDateLabel')}
                </label>
                <input
                  id="task-due-date"
                  {...register('dueDate')}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  aria-invalid={Boolean(errors.dueDate)}
                  aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
                  className={`w-full bg-white dark:bg-slate-800/80 border ${
                    errors.dueDate ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-purple-500/20'
                  } focus:ring-2 rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition duration-150 cursor-pointer dark:[color-scheme:dark]`}
                />
              </div>
              <div>
                <label htmlFor="task-due-time" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t('dueTimeLabel')}
                </label>
                <input
                  id="task-due-time"
                  type="time"
                  step="1"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  className="w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none transition"
                />
              </div>
            </div>
            {errors.dueDate && (
              <p id="dueDate-error" role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Optional Reminder Field */}
          <div className="rounded-2xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-3">
            <label htmlFor="task-reminder-enabled" className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Bell className="w-4 h-4 text-purple-500" />
                {t('reminderLabel')}
              </span>
              <input
                id="task-reminder-enabled"
                type="checkbox"
                checked={reminderEnabled}
                onChange={(event) => setReminderEnabled(event.target.checked)}
                className="w-4 h-4 accent-purple-600"
              />
            </label>

            {reminderEnabled && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] text-slate-500 dark:text-slate-400">{t('reminderBeforeTask')}</p>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,1fr)] gap-2">
                  <input
                    id="task-reminder"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={reminderAmount}
                    onChange={(event) => setReminderAmount(event.target.value)}
                    aria-label={t('reminderAmount')}
                    className="min-w-0 w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3 py-2.5 text-sm outline-none"
                  />
                  <select
                    value={reminderUnit}
                    onChange={(event) => setReminderUnit(event.target.value as ReminderUnit)}
                    aria-label={t('reminderUnit')}
                    className="min-w-0 w-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="seconds">{t('seconds')}</option>
                    <option value="minutes">{t('minutes')}</option>
                    <option value="hours">{t('hours')}</option>
                    <option value="days">{t('days')}</option>
                  </select>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">{t('reminderHint')}</p>
                {errors.reminderAt && (
                  <p role="alert" className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                    {errors.reminderAt.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Task Attachments */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/70 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <Paperclip className="w-4 h-4 text-purple-500" />
                  {t('attachmentsLabel')}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{t('attachmentsHint')}</p>
              </div>
              <label className="shrink-0 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-100 cursor-pointer transition">
                {t('chooseFiles')}
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx"
                  className="sr-only"
                  onChange={(event) => {
                    handleFileSelection(event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>
            </div>

            {(existingAttachments.length > 0 || selectedFiles.length > 0) && (
              <div className="mt-3 space-y-2">
                {existingAttachments.map((attachment) => (
                  <div key={attachment._id} className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2">
                    <FileText className="w-4 h-4 shrink-0 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => downloadTaskAttachment(initialData!._id, attachment)}
                      className="min-w-0 flex-1 text-left rtl:text-right"
                    >
                      <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{attachment.originalName}</span>
                      <span className="block text-[10px] text-slate-400">{formatFileSize(attachment.size)}</span>
                    </button>
                    <Download className="w-3.5 h-3.5 text-purple-500" />
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingAttachment(attachment._id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                        aria-label={t('removeAttachment')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-2 rounded-xl bg-purple-50/70 dark:bg-purple-500/10 px-2.5 py-2">
                    <FileText className="w-4 h-4 shrink-0 text-purple-500" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{file.name}</span>
                      <span className="block text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      aria-label={t('removeAttachment')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {attachmentError && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-500">{attachmentError}</p>
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
