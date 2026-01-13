// Minimal test server
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 500;

app.use(cors({ origin: true }));
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK', message: 'Server is working!' });
});

// Public products endpoint
app.get('/api/public/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      products,
      total: products.length,
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`✅ Test Server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Products: http://localhost:${PORT}/api/public/products`);
});

server.on('error', (error: any) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

// Keep server alive
setInterval(() => {
  // Just keep the process running
}, 1000);
