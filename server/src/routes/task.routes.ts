import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
  taskIdParamSchema,
} from '../schemas/task.schema.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createTaskSchema }), TaskController.createTask);
router.get('/', validate({ query: queryTaskSchema }), TaskController.getTasks);
router.get('/:id', validate({ params: taskIdParamSchema }), TaskController.getTaskById);
router.patch('/:id', validate({ params: taskIdParamSchema, body: updateTaskSchema }), TaskController.updateTask);
router.delete('/:id', validate({ params: taskIdParamSchema }), TaskController.deleteTask);

export default router;
