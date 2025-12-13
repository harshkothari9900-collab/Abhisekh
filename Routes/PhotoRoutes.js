const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const {
  createPhoto,
  getAllPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  deleteSpecificImage,
} = require('../Controller/PhotoController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Public
router.get('/photo/all', getAllPhotos);
router.get('/photo/:id', getPhotoById);

// Protected (requires token)
router.post('/photo/create', auth, (req, res, next) => {
  upload.array('images', 60)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
}, createPhoto);
router.put('/photo/:id', auth, (req, res, next) => {
  upload.array('images', 60)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
}, updatePhoto);
router.delete('/photo/:id', auth, deletePhoto);
router.delete('/photo/:id/image', auth, deleteSpecificImage);

module.exports = router;