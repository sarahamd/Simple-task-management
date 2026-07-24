import { Router } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json(ApiResponse.success({ status: 'UP', timestamp: new Date() }, 'Server operational'));
});

export default router;
