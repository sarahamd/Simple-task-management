import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Task } from '../types';

describe('DeleteConfirmModal Component', () => {
  const dummyTask: Task = {
    _id: 'task-999',
    title: 'Task to be deleted',
    description: 'Description',
    status: 'todo',
    priority: 'high',
    owner: 'user-1',
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders task title and confirmation prompt when open', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        task={dummyTask}
      />
    );

    expect(screen.getAllByText('Delete Task').length).toBeGreaterThan(0);
    expect(screen.getByText('Are you sure you want to delete this task?')).toBeDefined();
    expect(screen.getByText('Task to be deleted')).toBeDefined();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /delete task/i })).toBeDefined();
  });

  it('calls onConfirm when Delete Task button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        task={dummyTask}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        task={dummyTask}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
