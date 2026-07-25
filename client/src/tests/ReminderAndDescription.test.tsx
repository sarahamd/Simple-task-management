import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskModal } from '../components/TaskModal';
import { TaskCard } from '../components/TaskCard';
import { BoardTaskCard } from '../components/BoardTaskCard';
import { Task } from '../types';

const fillRequiredTaskFields = () => {
  fireEvent.change(screen.getByPlaceholderText('e.g. Design Landing Page'), {
    target: { value: 'Timed reminder task' },
  });
  fireEvent.change(screen.getByPlaceholderText('Add key details or acceptance criteria...'), {
    target: { value: 'Reminder details' },
  });
  fireEvent.change(screen.getByLabelText(/due date/i), {
    target: { value: '2026-12-31' },
  });
  fireEvent.change(screen.getByLabelText(/^time$/i), {
    target: { value: '12:00' },
  });
};

describe('Relative reminders and responsive descriptions', () => {
  it('calculates a reminder three hours before the task due time', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={null} />);

    fillRequiredTaskFields();
    fireEvent.click(screen.getByLabelText(/remind me before this task/i));
    fireEvent.change(screen.getByLabelText(/reminder amount/i), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/reminder unit/i), { target: { value: 'hours' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(new Date(submitted.dueDate).getTime() - new Date(submitted.reminderAt).getTime()).toBe(3 * 60 * 60 * 1000);
  });

  it('supports a five-second reminder offset', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={null} />);

    fillRequiredTaskFields();
    fireEvent.click(screen.getByLabelText(/remind me before this task/i));
    fireEvent.change(screen.getByLabelText(/reminder amount/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/reminder unit/i), { target: { value: 'seconds' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submitted = onSubmit.mock.calls[0][0];
    expect(new Date(submitted.dueDate).getTime() - new Date(submitted.reminderAt).getTime()).toBe(5000);
  });

  it('keeps a long expanded description inside a scrollable card', () => {
    const task: Task = {
      _id: 'task-long-description',
      title: 'Responsive card',
      description: 'A'.repeat(1000),
      status: 'todo',
      priority: 'medium',
      owner: 'owner',
      dueDate: '2026-12-31T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    render(
      <TaskCard
        task={task}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusToggle={vi.fn()}
      />
    );

    const description = screen.getByText(task.description);
    expect(description.className).toContain('line-clamp-2');
    fireEvent.click(screen.getByLabelText(/see full description/i));
    expect(description.className).toContain('max-h-40');
    expect(description.className).toContain('overflow-y-auto');
    expect(description.className).toContain('[overflow-wrap:anywhere]');
  });

  it('only shows the description link when content exceeds two lines', () => {
    const shortTask: Task = {
      _id: 'task-short-description',
      title: 'Short card',
      description: 'One short line.',
      status: 'todo',
      priority: 'low',
      owner: 'owner',
      dueDate: '2026-12-31T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const { unmount } = render(
      <TaskCard task={shortTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusToggle={vi.fn()} />
    );
    expect(screen.queryByText('See full description')).toBeNull();
    unmount();

    render(
      <BoardTaskCard
        task={{ ...shortTask, _id: 'board-long', description: 'Long text '.repeat(40) }}
        statusTheme={{ accentColor: '#d97706', borderColor: 'border-amber-600', headerBg: 'bg-amber-600' }}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDragStart={vi.fn()}
      />
    );
    expect(screen.getByText('See full description')).toBeDefined();
  });

  it('submits selected task attachments with the task form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskModal isOpen onClose={vi.fn()} onSubmit={onSubmit} initialData={null} />);
    fillRequiredTaskFields();

    const attachment = new File(['attachment content'], 'requirements.txt', {
      type: 'text/plain',
    });
    fireEvent.change(screen.getByLabelText(/choose files/i), {
      target: { files: [attachment] },
    });
    expect(screen.getByText('requirements.txt')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].newAttachments).toEqual([attachment]);
  });
});
