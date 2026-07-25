import React from 'react';
import { Search, RotateCcw, ArrowUpDown, SlidersHorizontal, ListChecks, CircleDotDashed, Clock3, CheckCircle2 } from 'lucide-react';
import { ColorSelect, SelectOption } from './ColorSelect';
import { useLanguage } from '../context/LanguageContext';

interface TaskFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  order: 'asc' | 'desc';
  setOrder: (val: 'asc' | 'desc') => void;
  onReset: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  sortBy,
  setSortBy,
  order,
  setOrder,
  onReset,
}) => {
  const { t } = useLanguage();

  const statusFilterOptions: SelectOption[] = [
    { value: '', label: t('allStatuses'), icon: <ListChecks className="w-4 h-4 text-slate-400" /> },
    { value: 'todo', label: t('statusTodo'), icon: <CircleDotDashed className="w-4 h-4 text-amber-500" /> },
    { value: 'in_progress', label: t('statusInProgress'), icon: <Clock3 className="w-4 h-4 text-blue-500" /> },
    { value: 'done', label: t('statusCompleted'), icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
  ];

  const priorityFilterOptions: SelectOption[] = [
    { value: '', label: t('allPriorities'), colorDot: 'bg-slate-400' },
    { value: 'low', label: t('priorityLow'), colorDot: 'bg-slate-400' },
    { value: 'medium', label: t('priorityMedium'), colorDot: 'bg-indigo-400' },
    { value: 'high', label: t('priorityHigh'), colorDot: 'bg-rose-400' },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'createdAt', label: t('sortCreatedAt') },
    { value: 'dueDate', label: t('sortDueDate') },
    { value: 'title', label: t('sortTitle') },
    { value: 'priority', label: t('sortPriority') },
    { value: 'status', label: t('sortStatus') },
  ];

  const hasActiveFilters = search || status || priority || sortBy !== 'createdAt' || order !== 'desc';

  return (
    <section className="bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-5 sm:mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <SlidersHorizontal className="w-4 h-4" />
          </span>
          {t('filtersTitle')}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('resetFilters')}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_160px_160px_180px_auto] gap-3 items-end">
      {/* Search Input */}
      <div>
        <label htmlFor="task-search" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Search</label>
        <div className="relative">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            id="task-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition duration-150"
          />
        </div>
      </div>

        {/* Status Filter */}
        <ColorSelect
          label={t('statusFilterLabel')}
          options={statusFilterOptions}
          value={status}
          onChange={setStatus}
          className="min-w-0"
        />

        {/* Priority Filter */}
        <ColorSelect
          label={t('priorityFilterLabel')}
          options={priorityFilterOptions}
          value={priority}
          onChange={setPriority}
          className="min-w-0"
        />

        {/* Sort Field */}
        <ColorSelect
          label={t('sortFilterLabel')}
          options={sortByOptions}
          value={sortBy}
          onChange={setSortBy}
          className="min-w-0"
        />

        {/* Order Toggle */}
        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="h-[42px] px-3 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition duration-150"
          title={order === 'asc' ? t('sortAscending') : t('sortDescending')}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

      </div>
    </section>
  );
};
