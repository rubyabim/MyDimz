import express from 'express';
import { 
  login, 
  initializeAdmin 
} from '../controllers/authController';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getPublicProducts,
  getProductById,
  getProductCategories
} from '../controllers/productController';
import { 
  createSale, 
  getSales 
} from '../controllers/saleController';
import { 
  authenticateToken, 
  requireAdmin 
} from '../middleware/auth';
import { 
  generateDailyReport, 
  generateMonthlyReport 
} from '../controllers/reportController';

const router = express.Router();

router.post('/auth/login', login);
router.post('/init', initializeAdmin);

router.get('/public/products', getPublicProducts);
router.get('/public/products/categories', getProductCategories);
router.get('/public/products/:id', getProductById);

router.get('/products', authenticateToken, getProducts);
router.post('/products', authenticateToken, requireAdmin, createProduct);
router.put('/products/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, deleteProduct);

router.post('/sales', authenticateToken, createSale);
router.get('/sales', authenticateToken, getSales);

router.get('/reports/daily', authenticateToken, generateDailyReport);
router.get('/reports/monthly', authenticateToken, generateMonthlyReport);

export default router;