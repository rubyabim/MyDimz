// src/routes/index.ts
import express from 'express';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import { login, initializeAdmin } from '../controllers/authController';
import multer from 'multer';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getProductById,
  getProductCategories,
} from '../controllers/productController';
import { createSale, getSales, getDailySales, getMonthlySales, getSalesStats, getSale, updateSale, deleteSale } from '../controllers/salesController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { prisma } from '../utils/database';
import {
  generateDailyReport,
  generateMonthlyReport,
  getDailySalesJson,
  getMonthlySalesJson,
  generateYearlyReport,
  getYearlySalesJson,
} from '../controllers/reportController';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// ===== BASE /api  =====
router.get('/', (req, res) => {
  res.json({
    message: 'Warung Ibuk Iyos API base',
    endpoints: [
      'POST   /api/auth/login',
      'POST   /api/init',
      'GET    /api/public/products',
      'GET    /api/public/products/categories',
      'GET    /api/public/products/:id',
      'GET    /api/products',
      'POST   /api/products',
      'PUT    /api/products/:id',
      'DELETE /api/products/:id',
      'POST   /api/uploads',
      'POST   /api/sales',
      'GET    /api/sales',
      'GET    /api/sales/daily',
      'GET    /api/sales/monthly',
      'GET    /api/sales/stats',
      'GET    /api/sales/:id',
      'PUT    /api/sales/:id',
      'DELETE /api/sales/:id',
      'GET    /api/reports/daily',
      'GET    /api/reports/daily/json',
      'GET    /api/reports/monthly',
      'GET    /api/reports/monthly/json',
      'GET    /api/reports/yearly',
      'GET    /api/reports/yearly/json',
      'GET    /api/health (atau /health)',
    ],
  });
});

// Serve the OpenAPI spec for import (e.g., APIdog can load this URL)
router.get('/openapi.yaml', (req, res) => {
  const openapiPath = path.resolve(__dirname, '../../openapi.yaml');
  res.sendFile(openapiPath);
});

// Also serve JSON version for consumers that prefer JSON
router.get('/openapi.json', (req, res) => {
  try {
    const openapiPath = path.resolve(__dirname, '../../openapi.yaml');
    const yamlStr = fs.readFileSync(openapiPath, 'utf8');
    const parsed = yaml.load(yamlStr);
    res.json(parsed);
  } catch (err) {
    console.error('Error serving openapi.json', err);
    res.status(500).json({ error: 'Failed to load OpenAPI spec' });
  }
});

// ========= AUTH =========
router.post('/auth/login', login);
router.post('/init', initializeAdmin);
router.get('/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, role: true, createdAt: true, updatedAt: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ========= PUBLIC PRODUCTS =========
// Specific routes BEFORE parameterized routes
router.get('/public/products/categories', getProductCategories);
router.get('/public/products', getPublicProducts);
router.get('/public/products/:id', getProductById);

// ========= PROTECTED PRODUCTS =========
router.get('/products', authenticateToken, getProducts);
router.post('/products', authenticateToken, requireAdmin, createProduct);
router.put('/products/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, deleteProduct);

// ========= UPLOADS =========
// Simple file upload for product images (admin only)
router.post('/uploads', authenticateToken, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // return both a relative path and absolute URL to the uploaded file.
  // The relative `path` is preferred (portable) and the `url` keeps
  // backward compatibility (older clients may still rely on it).
  const host = `${req.protocol}://${req.get('host')}`;
  const pathStr = `/uploads/${req.file.filename}`;
  const url = `${host}${pathStr}`;
  res.json({ path: pathStr, url });
});

// ========= SALES =========
router.post('/sales', createSale);
router.get('/sales', authenticateToken, getSales);
// Specific routes must come BEFORE parameterized routes
router.get('/sales/daily', authenticateToken, getDailySales);
router.get('/sales/monthly', authenticateToken, getMonthlySales);
router.get('/sales/stats', authenticateToken, getSalesStats);
// Parameterized routes after specific ones
router.get('/sales/:id', authenticateToken, getSale);
router.put('/sales/:id', authenticateToken, updateSale);
router.delete('/sales/:id', authenticateToken, deleteSale);

// ========= REPORTS =========
router.get('/reports/daily', authenticateToken, generateDailyReport);
router.get('/reports/monthly', authenticateToken, generateMonthlyReport);
router.get('/reports/daily/json', authenticateToken, getDailySalesJson);
router.get('/reports/monthly/json', authenticateToken, getMonthlySalesJson);
router.get('/reports/yearly', authenticateToken, generateYearlyReport);
router.get('/reports/yearly/json', authenticateToken, getYearlySalesJson);

// ========= HEALTH CHECK =========
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Warung Ibuk Iyos API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
