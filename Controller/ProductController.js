const Product = require('../Models/Product');
const Category = require('../Models/Category');
const cloudinary = require('cloudinary').v2;

// @desc Create a new product
// @route POST /abhisekh/product/create
// @access Private (requires auth)
exports.createProduct = async (req, res) => {
  try {
    const { productName, description, categoryId } = req.body;

    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    // Check if category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
    }

    let productImageUrl = null;
    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      productImageUrl = result.secure_url;
    }

    const createdBy = { id: req.admin.id, name: req.admin.fullName, email: req.admin.email };

    const product = new Product({ 
      productImage: productImageUrl, 
      productName: productName ? productName.trim() : '', 
      description: description ? description.trim() : '', 
      categoryId: categoryId || null, 
      createdBy 
    });
    await product.save();

    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating product', error: error.message });
  }
};

// @desc Get all products
// @route GET /abhisekh/product/all
// @access Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('categoryId', 'category_name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products', error: error.message });
  }
};

// @desc Get single product by id
// @route GET /abhisekh/product/:id
// @access Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'category_name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product', error: error.message });
  }
};

// @desc Update product
// @route PUT /abhisekh/product/:id
// @access Private (requires auth)
exports.updateProduct = async (req, res) => {
  try {
    const { productName, description, categoryId } = req.body;

    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (categoryId) {
      // Check if category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }
      product.categoryId = categoryId;
    }

    if (req.file) {
      // Upload new image to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      product.productImage = result.secure_url;
    }

    if (productName !== undefined) product.productName = productName ? productName.trim() : '';
    if (description !== undefined) product.description = description ? description.trim() : '';

    await product.save();
    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating product', error: error.message });
  }
};

// @desc Delete product
// @route DELETE /abhisekh/product/:id
// @access Private (requires auth)
exports.deleteProduct = async (req, res) => {
  try {
    // Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin authentication required' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting product', error: error.message });
  }
};