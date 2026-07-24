import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedInput);
      res.status(201).json(ApiResponse.success(result, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedInput);
      res.status(200).json(ApiResponse.success(result, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getUserById(userId);
      res.status(200).json(ApiResponse.success({ user }, 'User profile retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
