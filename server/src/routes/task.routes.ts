import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
  taskIdParamSchema,
  taskAttachmentParamSchema,
} from '../schemas/task.schema.js';
import { uploadTaskAttachments } from '../middleware/attachment.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', validate({ body: createTaskSchema }), TaskController.createTask);
router.get('/', validate({ query: queryTaskSchema }), TaskController.getTasks);
router.get('/:id', validate({ params: taskIdParamSchema }), TaskController.getTaskById);
router.post(
  '/:id/attachments',
  validate({ params: taskIdParamSchema }),
  uploadTaskAttachments,
  TaskController.addAttachments
);
router.get(
  '/:id/attachments/:attachmentId',
  validate({ params: taskAttachmentParamSchema }),
  TaskController.downloadAttachment
);
router.delete(
  '/:id/attachments/:attachmentId',
  validate({ params: taskAttachmentParamSchema }),
  TaskController.deleteAttachment
);
router.patch('/:id', validate({ params: taskIdParamSchema, body: updateTaskSchema }), TaskController.updateTask);
router.delete('/:id', validate({ params: taskIdParamSchema }), TaskController.deleteTask);

export default router;
