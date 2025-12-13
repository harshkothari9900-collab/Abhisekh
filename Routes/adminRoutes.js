const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  loginAdmin,
  registerAdmin,
  getAllAdmins,
  getAdminById,
  getAdminsByCreatedBy,
  updateAdmin,
  deleteAdmin,
  deactivateAdmin,
  activateAdmin,
} = require('../Controller/adminController');

// Public routes
router.post('/login', loginAdmin);
router.post('/register', registerAdmin);

// Protected routes (require authentication)
router.get('/all', auth, getAllAdmins);
router.get('/:id', auth, getAdminById);
router.get('/created-by/me', auth, getAdminsByCreatedBy);
router.put('/:id', auth, updateAdmin);
router.delete('/:id', auth, deleteAdmin);
router.put('/deactivate/:id', auth, deactivateAdmin);
router.put('/activate/:id', auth, activateAdmin);

module.exports = router;