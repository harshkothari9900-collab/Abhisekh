const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../Controller/ProductController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public
router.get('/product/all', getAllProducts);
router.get('/product/:id', getProductById);

// Protected (requires token)
router.post('/product/create', auth, upload.single('productImage'), createProduct);
router.put('/product/:id', auth, upload.single('productImage'), updateProduct);
router.delete('/product/:id', auth, deleteProduct);

module.exports = router;