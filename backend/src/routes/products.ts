import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import { validateProduct, validateProductUpdate, validateProductId } from '../middlewares/validation';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', authMiddleware, validateProduct, createProduct);
router.patch('/:productId', authMiddleware, validateProductUpdate, updateProduct);
router.delete('/:productId', authMiddleware, validateProductId, deleteProduct);

export default router;
