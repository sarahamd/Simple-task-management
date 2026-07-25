import express from 'express';
import mongoose from 'mongoose';
import { app } from './src/app.js';
import { connectDB } from './src/config/db.js';

const vercelApp = express();
let connectionPromise: Promise<void> | null = null;

vercelApp.use(async (_req, _res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      connectionPromise ??= connectDB().finally(() => {
        connectionPromise = null;
      });
      await connectionPromise;
    }
    next();
  } catch (error) {
    next(error);
  }
});

vercelApp.use(app);

export default vercelApp;
