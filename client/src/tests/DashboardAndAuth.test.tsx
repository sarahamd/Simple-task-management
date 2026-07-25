import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { TaskModal } from '../components/TaskModal';
import { EmptyState } from '../components/EmptyState';
import { Pagination } from '../components/Pagination';
import { AuthProvider } from '../context/AuthContext';

describe('Frontend UI & Component Flow', () => {
  it('ProtectedRoute redirects unauthenticated user to /login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<div>Dashboard Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Login Screen')).toBeDefined();
    expect(screen.queryByText('Dashboard Content')).toBeNull();
  });

  it('TaskModal renders inputs and validates title on submit', async () => {
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

    expect(screen.getByText('Create New Task')).toBeDefined();

    const titleInput = screen.getByPlaceholderText('e.g. Design Landing Page');
    expect(titleInput).toBeDefined();

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeDefined();
      expect(screen.getByText('Due date is required')).toBeDefined();
    });
  });

  it('EmptyState renders different UI when filters are active vs no tasks', () => {
    const onClearFilters = vi.fn();
    const onCreateTask = vi.fn();

    const { rerender } = render(
      <EmptyState
        hasFilters={false}
        onClearFilters={onClearFilters}
        onCreateTask={onCreateTask}
      />
    );

    expect(screen.getByText('No tasks created yet')).toBeDefined();

    rerender(
      <EmptyState
        hasFilters={true}
        onClearFilters={onClearFilters}
        onCreateTask={onCreateTask}
      />
    );

    expect(screen.getByText('No matching tasks found')).toBeDefined();
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeDefined();
  });

  it('Pagination renders page info and triggers onPageChange', () => {
    const onPageChange = vi.fn();
    const pagination = {
      page: 2,
      limit: 5,
      total: 15,
      totalPages: 3,
    };

    render(<Pagination pagination={pagination} onPageChange={onPageChange} />);

    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getByText(/15 total tasks/i)).toBeDefined();

    const prevBtn = screen.getByRole('button', { name: /previous page/i });
    const nextBtn = screen.getByRole('button', { name: /next page/i });

    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
