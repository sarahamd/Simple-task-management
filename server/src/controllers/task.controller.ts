import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { QueryTaskInput } from '../schemas/task.schema.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { AppError } from '../utils/AppError.js';

export class TaskController {
  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const task = await TaskService.createTask(userId, req.body);
      res.status(201).json(ApiResponse.success(task, 'Task created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await TaskService.getTasks(userId, req.query as unknown as QueryTaskInput);
      res.status(200).json(ApiResponse.success(result.tasks, 'Tasks retrieved successfully', result.pagination));
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const task = await TaskService.getTaskById(userId, id);
      res.status(200).json(ApiResponse.success(task, 'Task retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const task = await TaskService.updateTask(userId, id, req.body);
      res.status(200).json(ApiResponse.success(task, 'Task updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      await TaskService.deleteTask(userId, id);
      res.status(200).json(ApiResponse.success(null, 'Task deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async addAttachments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      if (files.length === 0) throw new AppError('At least one attachment is required', 400);
      const task = await TaskService.addAttachments(req.user!.id, req.params.id, files);
      res.status(201).json(ApiResponse.success(task, 'Attachments uploaded successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async downloadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachment = await TaskService.getAttachment(
        req.user!.id,
        req.params.id,
        req.params.attachmentId
      );
      res.type(attachment.mimeType);
      res.download(attachment.filePath, attachment.originalName, (error) => {
        if (error && !res.headersSent) next(error);
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await TaskService.deleteAttachment(
        req.user!.id,
        req.params.id,
        req.params.attachmentId
      );
      res.status(200).json(ApiResponse.success(task, 'Attachment deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}
