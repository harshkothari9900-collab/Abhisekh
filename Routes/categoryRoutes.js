const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../Controller/CategoryController');

// Public
router.get('/category/all', getAllCategories);
router.get('/category/:id', getCategoryById);

// Protected (requires token)
router.post('/category/create', auth, createCategory);
router.put('/category/:id', auth, updateCategory);
router.delete('/category/:id', auth, deleteCategory);

module.exports = router;