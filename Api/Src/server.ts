// src/server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './routes';
import './types';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static upload folder
app.use('/uploads', express.static('uploads'));

// Base API routes → semua URL di routes akan diawali /api
app.use('/api', routes);

// Health check (TANPA /api)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Warung Ibuk Iyos API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root info, biar / juga ada respon
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Warung Ibuk Iyos API',
    health: '/health',
    baseApi: '/api',
  });
});

// 404 handler
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

app.listen(PORT, () => {
  console.log(`🚀 Server Warung Ibuk Iyos berjalan di port ${PORT}`);
  console.log(`📊 Health check:  http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL:  http://localhost:${PORT}/api`);
});
