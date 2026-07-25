import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardTaskCard } from '../components/BoardTaskCard';
import { Task } from '../types';

describe('BoardTaskCard Component', () => {
  const dummyTask: Task = {
    _id: 'task-999',
    title: 'KANBAN TASK 01',
    description: 'Kanban description',
    status: 'in_progress',
    priority: 'high',
    owner: 'user-456',
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const statusTheme = {
    accentColor: '#1e3a8a',
    borderColor: 'border-blue-900',
    headerBg: 'bg-blue-900 text-white',
  };

  it('renders title, task ID tag, and is draggable', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onDragStart = vi.fn();

    render(
      <BoardTaskCard
        task={dummyTask}
        statusTheme={statusTheme}
        onEdit={onEdit}
        onDelete={onDelete}
        onDragStart={onDragStart}
      />
    );

    expect(screen.getByText('KANBAN TASK 01')).toBeDefined();
    expect(screen.getByText('Task-999')).toBeDefined();

    const card = screen.getByText('KANBAN TASK 01').closest('div');
    expect(card).toBeDefined();

    if (card) {
      fireEvent.dragStart(card);
      expect(onDragStart).toHaveBeenCalled();
    }
  });
});
