import mongoose from 'mongoose';
import { Task, ITask } from '../models/task.model.js';
import { CreateTaskInput, UpdateTaskInput, QueryTaskInput } from '../schemas/task.schema.js';
import { AppError } from '../utils/AppError.js';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR } from '../config/uploads.js';

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
  private static async removeStoredFiles(storedNames: string[]): Promise<void> {
    await Promise.all(
      storedNames.map((storedName) =>
        unlink(path.join(UPLOAD_DIR, path.basename(storedName))).catch(() => undefined)
      )
    );
  }

  static async createTask(userId: string, input: CreateTaskInput): Promise<ITask> {
    const task = await Task.create({
      ...input,
      dueDate: new Date(input.dueDate),
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
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

    const updateData: Record<string, unknown> = { ...input };
    if (input.dueDate) {
      updateData.dueDate = new Date(input.dueDate);
    }
    if (input.reminderAt !== undefined) {
      updateData.reminderAt = input.reminderAt ? new Date(input.reminderAt) : null;
    }

    // STRICT ENFORCEMENT: Filter by both _id and owner in single query
    const task = await Task.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(taskId),
        owner: new mongoose.Types.ObjectId(userId),
      },
      { $set: updateData },
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
    await this.removeStoredFiles(task.attachments.map((attachment) => attachment.storedName));
  }

  static async addAttachments(
    userId: string,
    taskId: string,
    files: Express.Multer.File[]
  ): Promise<ITask> {
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      owner: new mongoose.Types.ObjectId(userId),
    });

    if (!task) {
      await this.removeStoredFiles(files.map((file) => file.filename));
      throw new AppError('Task not found', 404);
    }
    if (task.attachments.length + files.length > 5) {
      await this.removeStoredFiles(files.map((file) => file.filename));
      throw new AppError('A task can have at most 5 attachments', 400);
    }

    task.attachments.push(
      ...files.map((file) => ({
        _id: new mongoose.Types.ObjectId(),
        originalName: file.originalname.slice(0, 255),
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
      }))
    );
    await task.save();
    return task;
  }

  static async getAttachment(
    userId: string,
    taskId: string,
    attachmentId: string
  ): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      owner: new mongoose.Types.ObjectId(userId),
      'attachments._id': new mongoose.Types.ObjectId(attachmentId),
    });
    const attachment = task?.attachments.find((item) => item._id.toString() === attachmentId);
    if (!attachment) throw new AppError('Attachment not found', 404);

    return {
      filePath: path.join(UPLOAD_DIR, path.basename(attachment.storedName)),
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
    };
  }

  static async deleteAttachment(userId: string, taskId: string, attachmentId: string): Promise<ITask> {
    const task = await Task.findOne({
      _id: new mongoose.Types.ObjectId(taskId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    if (!task) throw new AppError('Task not found', 404);

    const attachment = task.attachments.find((item) => item._id.toString() === attachmentId);
    if (!attachment) throw new AppError('Attachment not found', 404);

    task.attachments = task.attachments.filter((item) => item._id.toString() !== attachmentId);
    await task.save();
    await this.removeStoredFiles([attachment.storedName]);
    return task;
  }
}
