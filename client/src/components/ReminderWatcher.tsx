import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BellRing, X } from 'lucide-react';
import api from '../api/axios';
import { ApiResponse, Task } from '../types';
import { useLanguage } from '../context/LanguageContext';

const notifiedKey = (taskId: string, reminderAt: string) => `task-reminder:${taskId}:${reminderAt}`;

export const ReminderWatcher: React.FC = () => {
  const { t } = useLanguage();
  const [activeReminders, setActiveReminders] = useState<Task[]>([]);

  const { data } = useQuery({
    queryKey: ['task-reminders'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Task[]>>('/tasks?limit=100&sortBy=dueDate&order=asc');
      return response.data.data;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const deliverReminder = useCallback((task: Task) => {
    if (!task.reminderAt) return;
    const storageKey = notifiedKey(task._id, task.reminderAt);
    if (localStorage.getItem(storageKey)) return;

    localStorage.setItem(storageKey, 'shown');
    setActiveReminders((current) => (
      current.some((item) => item._id === task._id && item.reminderAt === task.reminderAt)
        ? current
        : [...current, task]
    ));

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('reminderDue'), {
        body: task.title,
        tag: storageKey,
      });
    }
  }, [t]);

  useEffect(() => {
    if (!data?.length) return;

    const now = Date.now();
    const pendingReminders = data
      .filter((task) => {
      if (!task.reminderAt || task.status === 'done') return false;
      const reminderTime = new Date(task.reminderAt).getTime();
      if (Number.isNaN(reminderTime)) return false;
      return !localStorage.getItem(notifiedKey(task._id, task.reminderAt));
      })
      .sort((first, second) => new Date(first.reminderAt!).getTime() - new Date(second.reminderAt!).getTime());

    const overdueReminders = pendingReminders.filter(
      (task) => new Date(task.reminderAt!).getTime() <= now
    );
    overdueReminders.forEach(deliverReminder);

    // Schedule every nearby reminder at its exact time so reminders only a few
    // seconds apart still fire independently. Polling covers sleep/throttling.
    const timerIds = pendingReminders
      .filter((task) => new Date(task.reminderAt!).getTime() > now)
      .map((task) => {
        const delay = new Date(task.reminderAt!).getTime() - now;
        return delay <= 2_147_000_000
          ? window.setTimeout(() => deliverReminder(task), delay)
          : null;
      })
      .filter((timerId): timerId is number => timerId !== null);

    return () => timerIds.forEach((timerId) => window.clearTimeout(timerId));
  }, [data, deliverReminder]);

  const activeReminder = activeReminders[0];
  if (!activeReminder) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 rtl:right-auto rtl:left-4 z-[70] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 p-4 shadow-2xl shadow-purple-900/20"
    >
      <div className="flex items-start gap-3">
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
          <BellRing className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{t('reminderDue')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{activeReminder.title}</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveReminders((current) => current.slice(1))}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          aria-label={t('dismiss')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
