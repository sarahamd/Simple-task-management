import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../components/TaskCard';
import { Task } from '../types';

describe('TaskCard Component', () => {
  const dummyTask: Task = {
    _id: 'task-123',
    title: 'Test Task Title',
    description: 'Test task description detail',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    owner: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders task title, status, and priority badges', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusToggle = vi.fn();

    render(
      <TaskCard
        task={dummyTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusToggle={onStatusToggle}
      />
    );

    expect(screen.getByText('Test Task Title')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('High')).toBeDefined();
  });

  it('triggers status toggle callback when status badge is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusToggle = vi.fn();

    render(
      <TaskCard
        task={dummyTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusToggle={onStatusToggle}
      />
    );

    const statusBtn = screen.getByTitle('Click to toggle status');
    fireEvent.click(statusBtn);
    expect(onStatusToggle).toHaveBeenCalledWith(dummyTask);
  });
});
