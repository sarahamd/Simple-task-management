import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { createTaskSchema, updateTaskSchema, queryTaskSchema } from '../schemas/task.schema.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
      const result = await TaskService.getTasks(userId, req.query as any);
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
}
