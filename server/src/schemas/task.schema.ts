import { z } from 'zod';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const taskStatusEnum = z.enum(['todo', 'in_progress', 'done'], {
  errorMap: (issue) => {
    if (issue.code === 'invalid_type' && issue.received === 'undefined') {
      return { message: 'Status is required' };
    }
    return { message: 'Status must be To Do, In Progress, or Done' };
  },
});

export const taskPriorityEnum = z.enum(['low', 'medium', 'high'], {
  errorMap: (issue) => {
    if (issue.code === 'invalid_type' && issue.received === 'undefined') {
      return { message: 'Priority is required' };
    }
    return { message: 'Priority must be Low, Medium, or High' };
  },
});

export const createTaskSchema = z
  .object({
    title: z
      .string({
        required_error: 'Title is required',
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must not exceed 120 characters'),

    description: z
      .string({
        required_error: 'Description is required',
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, 'Description is required')
      .max(2000, 'Description must not exceed 2000 characters'),

    status: taskStatusEnum,

    priority: taskPriorityEnum,

    dueDate: z
      .string({
        required_error: 'Due date is required',
        invalid_type_error: 'Due date is required',
      })
      .min(1, 'Due date is required')
      .refine((value) => {
        const d = new Date(value);
        return !Number.isNaN(d.getTime());
      }, 'Please enter a valid due date')
      .refine((value) => {
        const parts = value.split('-').map(Number);
        if (parts.length === 3 && !parts.some(isNaN)) {
          const date = new Date(parts[0], parts[1] - 1, parts[2]);
          return date >= startOfToday();
        }
        const d = new Date(value);
        return d >= startOfToday();
      }, 'Due date cannot be in the past'),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string({
        invalid_type_error: 'Title must be a string',
      })
      .trim()
      .min(1, 'Title is required')
      .max(120, 'Title must not exceed 120 characters')
      .optional(),

    description: z
      .string({
        invalid_type_error: 'Description must be a string',
      })
      .trim()
      .min(1, 'Description is required')
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),

    status: taskStatusEnum.optional(),

    priority: taskPriorityEnum.optional(),

    dueDate: z
      .string({
        invalid_type_error: 'Due date is required',
      })
      .min(1, 'Due date is required')
      .refine((value) => {
        const d = new Date(value);
        return !Number.isNaN(d.getTime());
      }, 'Please enter a valid due date')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one task field must be provided',
  });

export const taskIdParamSchema = z.object({
  id: z
    .string({ required_error: 'Task ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format'),
});

export const queryTaskSchema = z.object({
  search: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: taskPriorityEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type QueryTaskInput = z.infer<typeof queryTaskSchema>;
