export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  reminderAt?: string | null;
  attachments?: TaskAttachment[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorItem {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  errors?: ApiErrorItem[];
  error?: {
    message: string;
    code?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface AuthResponseData {
  user: User;
  token: string;
}
