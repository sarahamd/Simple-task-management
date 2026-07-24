import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from './app.js';

async function start() {
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.18',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log(`[Test Server] Connected to in-memory MongoDB at ${uri}`);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Test Server] Listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Test Server] Failed to start:', err);
  process.exit(1);
});
