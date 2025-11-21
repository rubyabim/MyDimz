// src/routes/index.ts
import express from 'express';
import { login, initializeAdmin } from '../controllers/authController';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getProductById,
  getProductCategories,
} from '../controllers/productController';
import { createSale, getSales } from '../controllers/saleController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  generateDailyReport,
  generateMonthlyReport,
} from '../controllers/reportController';

const router = express.Router();

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
      'POST   /api/sales',
      'GET    /api/sales',
      'GET    /api/reports/daily',
      'GET    /api/reports/monthly',
    ],
  });
});

// ========= AUTH =========
router.post('/auth/login', login);
router.post('/init', initializeAdmin);

// ========= PUBLIC PRODUCTS =========
router.get('/public/products', getPublicProducts);
router.get('/public/products/categories', getProductCategories);
router.get('/public/products/:id', getProductById);

// ========= PROTECTED PRODUCTS =========
router.get('/products', authenticateToken, getProducts);
router.post('/products', authenticateToken, requireAdmin, createProduct);
router.put('/products/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, deleteProduct);

// ========= SALES =========
router.post('/sales', authenticateToken, createSale);
router.get('/sales', authenticateToken, getSales);

// ========= REPORTS =========
router.get('/reports/daily', authenticateToken, generateDailyReport);
router.get('/reports/monthly', authenticateToken, generateMonthlyReport);

export default router;
