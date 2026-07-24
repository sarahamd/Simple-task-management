import mongoose from 'mongoose';
import { Task, ITask } from '../models/task.model.js';
import { CreateTaskInput, UpdateTaskInput, QueryTaskInput } from '../schemas/task.schema.js';
import { AppError } from '../utils/AppError.js';

export interface PaginatedTasks {
  tasks: ITask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class TaskService {
  static async createTask(userId: string, input: CreateTaskInput): Promise<ITask> {
    const task = await Task.create({
      ...input,
      owner: new mongoose.Types.ObjectId(userId),
    });
    return task;
  }

  static async getTasks(userId: string, query: QueryTaskInput): Promise<PaginatedTasks> {
    const filter: Record<string, unknown> = {
      owner: new mongoose.Types.ObjectId(userId),
    };

    if (query.search) {
      const escapedSearch = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escapedSearch, $options: 'i' };
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getTaskById(userId: string, taskId: string): Promise<ITask> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    // STRICT ENFORCEMENT: Filter by both _id and owner in single query
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  static async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<ITask> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    // STRICT ENFORCEMENT: Filter by both _id and owner in single query
    const task = await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(taskId),
        owner: new mongoose.Types.ObjectId(userId),
      },
      { $set: input },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError('Invalid task ID format', 400);
    }

    // STRICT ENFORCEMENT: Filter by both _id and owner in single query
    const task = await Task.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(taskId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }
  }
}
