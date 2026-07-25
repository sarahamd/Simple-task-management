import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { UPLOAD_DIR } from '../config/uploads.js';
import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10);
    callback(null, `${randomUUID()}${extension}`);
  },
});

export const uploadTaskAttachments = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError('Unsupported attachment type', 400));
      return;
    }
    callback(null, true);
  },
}).array('attachments', 5);
