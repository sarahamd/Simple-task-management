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
import { Plus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
    };
    await updateMutation.mutateAsync({
      id: task._id,
      data: { status: nextStatus[task.status] },
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteMutation.mutateAsync(id);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Task Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage, filter, and track your daily priorities</p>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition duration-200"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Task Filters */}
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

        {/* Error State */}
        {isError && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-center justify-between">
            <span>{error instanceof Error ? error.message : 'Failed to load tasks from server.'}</span>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition"
            >
              Retry
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
                  onDelete={handleDelete}
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
    </div>
  );
};

export default DashboardPage;
