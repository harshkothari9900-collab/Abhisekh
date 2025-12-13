const { Photo } = require('../Models/Photo');
const cloudinary = require('cloudinary').v2;

// @desc Create a new photo
// @route POST /abhisekh/photo/create
// @access Private (requires auth)
exports.createPhoto = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    // Upload each image to Cloudinary
    const imageUrls = [];
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'photo' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });
      imageUrls.push(result.secure_url);
    }

    const photo = new Photo({
      images: imageUrls
    });
    await photo.save();

    res.status(201).json({ success: true, message: 'Photo created', data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating photo', error: error.message });
  }
};// @desc Get all photos
// @route GET /abhisekh/photo/all
// @access Public
exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find()
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: photos.length, data: photos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching photos', error: error.message });
  }
};

// @desc Get single photo by id
// @route GET /abhisekh/photo/:id
// @access Public
exports.getPhotoById = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    res.status(200).json({ success: true, data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching photo', error: error.message });
  }
};

// @desc Update photo
// @route PUT /abhisekh/photo/:id
// @access Private (requires auth)
exports.updatePhoto = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    let imageUrls = photo.images;
    if (req.files && req.files.length > 0) {
      // Upload new images to Cloudinary
      imageUrls = [];
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'photo' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    photo.images = imageUrls;
    await photo.save();

    res.status(200).json({ success: true, message: 'Photo updated', data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating photo', error: error.message });
  }
};

// @desc Delete photo
// @route DELETE /abhisekh/photo/:id
// @access Private (requires auth)
exports.deletePhoto = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting photo', error: error.message });
  }
};

// @desc Delete specific image from photo
// @route DELETE /abhisekh/photo/:id/image
// @access Private (requires auth)
exports.deleteSpecificImage = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });

    // Check if image exists in the array
    const imageIndex = photo.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({ success: false, message: 'Image not found in photo' });
    }

    // Remove image from array
    photo.images.splice(imageIndex, 1);

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = `photo/${publicIdWithExt.split('.')[0]}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    await photo.save();

    res.status(200).json({ success: true, message: 'Image deleted successfully', data: photo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting image', error: error.message });
  }
};