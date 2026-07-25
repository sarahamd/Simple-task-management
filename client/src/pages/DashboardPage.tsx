import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Task, ApiResponse, TaskStatus } from '../types';
import { Navbar } from '../components/Navbar';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { Pagination } from '../components/Pagination';
import { TaskSkeletonGrid } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { TaskModal, TaskFormData } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Plus, LayoutGrid, Kanban } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Fetch tasks with TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks', { search, status, priority, sortBy, order, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (sortBy) params.append('sortBy', sortBy);
      if (order) params.append('order', order);
      params.append('page', page.toString());
      params.append('limit', '6');

      const response = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
      return response.data;
    },
  });

  // Create Task Mutation
  const createMutation = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      const response = await api.post<ApiResponse<Task>>('/tasks', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskFormData> }) => {
      const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<null>>(`/tasks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleCreateOrUpdate = async (formData: TaskFormData) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    await updateMutation.mutateAsync({
      id: task._id,
      data: { status: nextStatus[task.status] },
    });
  };

  const handleDeleteClick = (id: string) => {
    const targetTask = tasks.find((t) => t._id === id);
    setTaskToDelete(targetTask || ({ _id: id, title: 'Selected Task' } as Task));
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteMutation.mutateAsync(taskToDelete._id);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  const tasks = data?.data || [];
  const pagination = data?.pagination;
  const hasActiveFilters = !!(search || status || priority || sortBy !== 'createdAt' || order !== 'desc');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('dashboardTitle')}
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('dashboardSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
            {/* View Switcher: Grid vs Board */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700/60">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs cursor-default"
              >
                <LayoutGrid className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('viewGrid')}</span>
              </button>
              <button
                onClick={() => navigate('/board')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
              >
                <Kanban className="w-4 h-4" />
                <span>{t('viewBoard')}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition duration-200 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t('newTask')}
            </button>
          </div>
        </div>

        {/* Task Filters */}
        <div className="relative z-30">
          <TaskFilters
            search={search}
            setSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
            status={status}
            setStatus={(val) => {
              setStatus(val);
              setPage(1);
            }}
            priority={priority}
            setPriority={(val) => {
              setPriority(val);
              setPage(1);
            }}
            sortBy={sortBy}
            setSortBy={setSortBy}
            order={order}
            setOrder={setOrder}
            onReset={handleResetFilters}
          />
        </div>

        {/* Error State */}
        {isError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center justify-between">
            <span>{error instanceof Error ? error.message : t('failedToLoad')}</span>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-lg font-medium transition"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <TaskSkeletonGrid count={6} />
        ) : tasks.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleResetFilters}
            onCreateTask={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={handleDeleteClick}
                  onStatusToggle={handleStatusToggle}
                />
              ))}
            </div>

            {pagination && <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />}
          </>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default DashboardPage;
