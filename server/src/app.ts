import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import taskRouter from './routes/task.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10kb' }));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', taskRouter);

  // Catch 404 routes
  app.use('*', (_req, _res, next) => {
    next(new AppError('Resource not found', 404));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
