import React from 'react';
import { Search, RotateCcw, ArrowUpDown } from 'lucide-react';

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
  const hasActiveFilters = search || status || priority || sortBy !== 'createdAt' || order !== 'desc';

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks by title..."
          className="w-full bg-slate-800/60 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
        />
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Sort Field */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500 transition cursor-pointer"
        >
          <option value="createdAt">Date Created</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>

        {/* Order Toggle */}
        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-indigo-400 transition"
          title={`Sort ${order === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition"
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
