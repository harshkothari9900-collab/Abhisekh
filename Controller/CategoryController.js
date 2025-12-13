const Category = require('../Models/Category');

// @desc Create a new category
// @route POST /abhisekh/category/create
// @access Private (requires auth)
exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ success: false, message: 'Category_name is required' });
    }

    // check duplicate
    const existing = await Category.findOne({ category_name: category_name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const createdBy = req.admin ? { id: req.admin.id, name: req.admin.fullName, email: req.admin.email } : null;

    const category = new Category({ category_name: category_name.trim(), createdBy });
    await category.save();

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating category', error: error.message });
  }
};

// @desc Get all categories
// @route GET /abhisekh/category/all
// @access Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching categories', error: error.message });
  }
};

// @desc Get single category by id
// @route GET /abhisekh/category/:id
// @access Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching category', error: error.message });
  }
};

// @desc Update category
// @route PUT /abhisekh/category/:id
// @access Private (requires auth)
exports.updateCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    if (category_name) category.category_name = category_name.trim();

    await category.save();
    res.status(200).json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating category', error: error.message });
  }
};

// @desc Delete category
// @route DELETE /abhisekh/category/:id
// @access Private (requires auth)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.status(200).json({ success: true, message: 'Category deleted', data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting category', error: error.message });
  }
};
