// src/index.ts
// Entry/export file to make the API easily importable from other projects

import router from './routes';
import { prisma } from './utils/database';
import * as controllers from './controllers';
import { authenticateToken, requireAdmin } from './middleware/auth';

// Export default Express Router so other apps can mount the API easily
export { router as apiRouter };
// Export prisma client for database access
export { prisma };
// Export middleware helpers
export { authenticateToken, requireAdmin };
// Export controllers grouped as named exports for convenience
export { controllers };
// Re-export types for TypeScript projects
export * from './types';

// Note: This file is meant for importing into another Express app.
// Example usage in another project:
// import express from 'express';
// import { apiRouter, authenticateToken } from 'path-to-this-api/dist';
// const app = express();
// app.use('/api', apiRouter);
