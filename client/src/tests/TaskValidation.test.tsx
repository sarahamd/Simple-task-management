import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskModal } from '../components/TaskModal';
import { Task } from '../types';

describe('Frontend Task Form & Field Validation', () => {
  it('1. Empty task form shows validation messages', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeDefined();
      expect(screen.getByText('Description is required')).toBeDefined();
      expect(screen.getByText('Due date is required')).toBeDefined();
    });
  });

  it('2. Whitespace-only title is rejected', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    fireEvent.change(titleInput, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeDefined();
    });
  });

  it('3. Whitespace-only description is rejected', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const descInput = screen.getByPlaceholderText('Add key details or acceptance criteria...');
    fireEvent.change(descInput, { target: { value: '    ' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeDefined();
    });
  });

  it('4. Invalid or missing due date is rejected', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Due date is required')).toBeDefined();
    });
  });

  it('5. Invalid form does not call the API', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeDefined();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('6. Valid form calls the API once', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    const descInput = screen.getByPlaceholderText('Add key details or acceptance criteria...');
    const dueDateInput = screen.getByLabelText(/due date/i);

    fireEvent.change(titleInput, { target: { value: 'Valid Frontend Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid Frontend Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('7. Submit button is disabled during submission', async () => {
    const onClose = vi.fn();
    let resolveSubmit: () => void;
    const onSubmit = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    const descInput = screen.getByPlaceholderText('Add key details or acceptance criteria...');
    const dueDateInput = screen.getByLabelText(/due date/i);

    fireEvent.change(titleInput, { target: { value: 'Valid Frontend Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid Frontend Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn.hasAttribute('disabled')).toBe(true);
    });

    resolveSubmit!();
  });

  it('8. Backend field errors are shown beside their fields', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockRejectedValue({
      response: {
        data: {
          success: false,
          message: 'Validation failed',
          errors: [
            { field: 'title', message: 'Title must not exceed 120 characters' },
          ],
        },
      },
    });

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={null}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    const descInput = screen.getByPlaceholderText('Add key details or acceptance criteria...');
    const dueDateInput = screen.getByLabelText(/due date/i);

    fireEvent.change(titleInput, { target: { value: 'Valid Frontend Title' } });
    fireEvent.change(descInput, { target: { value: 'Valid Frontend Description' } });
    fireEvent.change(dueDateInput, { target: { value: '2026-12-31' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Title must not exceed 120 characters')).toBeDefined();
    });
  });

  it('9. Edit form loads existing values', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    const dummyTask: Task = {
      _id: 'task-777',
      title: 'Existing Task Title',
      description: 'Existing Description Detail',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-12-31T00:00:00.000Z',
      owner: 'user-777',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={dummyTask}
      />
    );

    expect(screen.getByText('Edit Task')).toBeDefined();
    expect((screen.getByPlaceholderText('e.g. Design Landing Page') as HTMLInputElement).value).toBe('Existing Task Title');
    expect((screen.getByPlaceholderText('Add key details or acceptance criteria...') as HTMLTextAreaElement).value).toBe('Existing Description Detail');
  });

  it('10. Valid partial edit succeeds', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    const dummyTask: Task = {
      _id: 'task-888',
      title: 'Task To Edit',
      description: 'Original Description',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-12-31T00:00:00.000Z',
      owner: 'user-888',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <TaskModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={dummyTask}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });

    const submitBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
