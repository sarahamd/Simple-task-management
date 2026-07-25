import React from 'react';
import { Search, RotateCcw, ArrowUpDown } from 'lucide-react';
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
    { value: '', label: t('allStatuses'), colorDot: 'bg-slate-400' },
    { value: 'todo', label: t('statusTodo'), colorDot: 'bg-amber-500' },
    { value: 'in_progress', label: t('statusInProgress'), colorDot: 'bg-blue-600' },
    { value: 'done', label: t('statusCompleted'), colorDot: 'bg-emerald-600' },
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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 sm:mb-6 shadow-sm dark:shadow-lg space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none shadow-xs transition duration-150"
        />
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <ColorSelect
          options={statusFilterOptions}
          value={status}
          onChange={setStatus}
          className="flex-1 sm:flex-none min-w-[105px] sm:min-w-[130px]"
        />

        {/* Priority Filter */}
        <ColorSelect
          options={priorityFilterOptions}
          value={priority}
          onChange={setPriority}
          className="flex-1 sm:flex-none min-w-[105px] sm:min-w-[130px]"
        />

        {/* Sort Field */}
        <ColorSelect
          options={sortByOptions}
          value={sortBy}
          onChange={setSortBy}
          className="flex-1 sm:flex-none min-w-[115px] sm:min-w-[140px]"
        />

        {/* Order Toggle */}
        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs transition duration-150"
          title={order === 'asc' ? t('sortAscending') : t('sortDescending')}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700/60 shadow-xs transition duration-150"
            title={t('resetFilters')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
