import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Task, ApiResponse, TaskStatus } from '../types';
import { Navbar } from '../components/Navbar';
import { BoardTaskCard } from '../components/BoardTaskCard';
import { TaskModal, TaskFormData } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ColorSelect } from '../components/ColorSelect';
import { Plus, LayoutGrid, Kanban, Search, RotateCcw, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ColumnConfig {
  id: TaskStatus;
  titleKey: 'statusTodo' | 'statusInProgress' | 'statusCompleted';
  defaultTitle: string;
  statuses: TaskStatus[];
  headerBg: string;
  accentColor: string;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    titleKey: 'statusTodo',
    defaultTitle: 'To Do',
    statuses: ['todo'],
    headerBg: 'bg-amber-600 text-white',
    accentColor: '#d97706',
    borderColor: 'border-amber-600',
  },
  {
    id: 'in_progress',
    titleKey: 'statusInProgress',
    defaultTitle: 'In Progress',
    statuses: ['in_progress'],
    headerBg: 'bg-blue-900 text-white',
    accentColor: '#1e3a8a',
    borderColor: 'border-blue-900',
  },
  {
    id: 'done',
    titleKey: 'statusCompleted',
    defaultTitle: 'Done',
    statuses: ['done'],
    headerBg: 'bg-emerald-900 text-white',
    accentColor: '#064e3b',
    borderColor: 'border-emerald-900',
  },
];

export const BoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [search, setSearch] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatusForNewTask, setDefaultStatusForNewTask] = useState<TaskStatus>('todo');

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Fetch all tasks for board view
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['tasks', { limit: 100 }],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Task[]>>('/tasks?limit=100');
      return response.data;
    },
  });

  const allTasks = data?.data || [];

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

  // Filter tasks locally by search & priority
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch = !search || task.title.toLowerCase().includes(search.toLowerCase()) || (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = !priority || task.priority === priority;
    return matchesSearch && matchesPriority;
  });

  const handleCreateOrUpdate = async (formData: TaskFormData) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteClick = (id: string) => {
    const targetTask = allTasks.find((t) => t._id === id);
    setTaskToDelete(targetTask || ({ _id: id, title: 'Selected Task' } as Task));
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteMutation.mutateAsync(taskToDelete._id);
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumnId(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const existingTask = allTasks.find((t) => t._id === taskId);
    if (!existingTask || existingTask.status === targetStatus) return;

    // Optimistically update status in cache
    queryClient.setQueryData<ApiResponse<Task[]>>(['tasks', { limit: 100 }], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t)),
      };
    });

    // Update on backend
    try {
      await updateMutation.mutateAsync({
        id: taskId,
        data: { status: targetStatus },
      });
    } catch {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  const handleAddNewTaskForColumn = (columnId: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatusForNewTask(columnId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col">
        {/* Top Header & View Switcher Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('viewBoard')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('kanbanSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher: Grid vs Board */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700/60">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{t('viewGrid')}</span>
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs transition cursor-default"
              >
                <Kanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{t('viewBoard')}</span>
              </button>
            </div>

            {/* New Task Button */}
            <button
              onClick={() => handleAddNewTaskForColumn('todo')}
              className="px-3.5 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-purple-600/25 flex items-center gap-2 transition duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('newTask')}
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-3 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-9 pr-3.5 rtl:pr-9 rtl:pl-3.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <ColorSelect
              options={[
                { value: '', label: t('allPriorities'), colorDot: 'bg-slate-400' },
                { value: 'low', label: t('priorityLow'), colorDot: 'bg-slate-400' },
                { value: 'medium', label: t('priorityMedium'), colorDot: 'bg-indigo-400' },
                { value: 'high', label: t('priorityHigh'), colorDot: 'bg-rose-400' },
              ]}
              value={priority}
              onChange={setPriority}
              className="min-w-[130px] sm:min-w-[150px]"
            />

            {(search || priority) && (
              <button
                onClick={() => {
                  setSearch('');
                  setPriority('');
                }}
                className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition"
                title={t('resetFilters')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
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
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading board tasks...</p>
          </div>
        ) : (
          /* Kanban Board Columns (3 Columns: To Do, In Progress, Done) */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-5 items-start overflow-x-auto pb-6">
            {COLUMNS.map((col) => {
              const columnTasks = filteredTasks.filter((t) => col.statuses.includes(t.status));
              const isOver = dragOverColumnId === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={(e) => handleDragLeave(e, col.id)}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`flex flex-col rounded-xl bg-slate-200/60 dark:bg-slate-900/60 border-2 transition-all duration-150 min-h-[550px] ${
                    isOver
                      ? `${col.borderColor} bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg scale-[1.01]`
                      : 'border-transparent'
                  }`}
                >
                  {/* Column Header Banner (Styled matching the reference image) */}
                  <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl font-bold shadow-xs ${col.headerBg}`}>
                    <span className="text-sm tracking-wide">
                      {t(col.titleKey as any) || col.defaultTitle}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* + Add Task button inside column header area */}
                  <div className="p-2 border-b border-slate-300/50 dark:border-slate-800">
                    <button
                      onClick={() => handleAddNewTaskForColumn(col.id)}
                      className="w-full py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('addTask')}
                    </button>
                  </div>

                  {/* Column Cards Drop Area */}
                  <div className="flex-1 p-2 space-y-3 overflow-y-auto max-h-[70vh]">
                    {columnTasks.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                        Drop items here
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <BoardTaskCard
                          key={task._id}
                          task={task}
                          statusTheme={col}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setIsModalOpen(true);
                          }}
                          onDelete={handleDeleteClick}
                          onDragStart={handleDragStart}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={
          editingTask ||
          ({
            status: defaultStatusForNewTask,
          } as Task)
        }
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

export default BoardPage;
