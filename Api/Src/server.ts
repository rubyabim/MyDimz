// src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import './types';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

console.log('');
console.log('📋 Starting server initialization...');
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📌 Port: ${PORT}`);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

console.log('✅ Middleware initialized');

// Routes
try {
  app.use('/api', routes);
  console.log('✅ Routes loaded');
} catch (err) {
  console.error('❌ Error loading routes:', err);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Warung Ibuk Iyos API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Warung Ibuk Iyos API',
    health: '/health',
    baseApi: '/api',
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
);

console.log('✅ Error handlers initialized');
console.log('');

// Start server
const server = app.listen(PORT, () => {
  console.log('════════════════════════════════════════');
  console.log('🚀 Server Warung Ibuk Iyos READY!');
  console.log('════════════════════════════════════════');
  console.log(`📊 Health check:  http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL:  http://localhost:${PORT}/api`);
  console.log('════════════════════════════════════════');
  console.log('');
});

server.on('error', (error: any) => {
  console.error('');
  console.error('❌ Server startup error:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} already in use!`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
