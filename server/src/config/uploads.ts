import { mkdirSync } from 'node:fs';
import path from 'node:path';

// Vercel Functions can only write temporary files under /tmp.
// Render/local deployments can continue to use their configured persistent path.
export const UPLOAD_DIR = process.env.VERCEL
  ? '/tmp/task-manager-uploads'
  : path.resolve(process.env.UPLOAD_DIR || 'uploads');

mkdirSync(UPLOAD_DIR, { recursive: true });
