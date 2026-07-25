import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateTask: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters, onClearFilters, onCreateTask }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center my-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
        <ClipboardList className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-200 mb-1">
        {hasFilters ? 'No matching tasks found' : 'No tasks created yet'}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
        {hasFilters
          ? 'Try adjusting your search query, status filter, or priority filter to find what you are looking for.'
          : 'Organize your workflow and keep track of your daily tasks by creating your first task.'}
      </p>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
        >
          Clear All Filters
        </button>
      ) : (
        <button
          onClick={onCreateTask}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create First Task
        </button>
      )}
    </div>
  );
};
