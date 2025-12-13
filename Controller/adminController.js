const Admin = require('../Models/Admin');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is inactive',
      });
    }

    // Create token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        createdBy: admin.createdBy,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @desc    Register New Admin (by existing admin or system)
// @route   POST /api/admin/register
// @access  Private (Protected)
exports.registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    // build createdBy object from authenticated admin (if present)
    const createdByObj = req.admin
      ? { id: req.admin.id, name: req.admin.fullName, email: req.admin.email }
      : null;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password',
      });
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create new admin
    const newAdmin = new Admin({
      fullName,
      email,
      password,
      createdBy: createdByObj,
    });

    await newAdmin.save();

    const token = generateToken(newAdmin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        createdBy: newAdmin.createdBy,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @desc    Get all admins
// @route   GET /api/admin/all
// @access  Private (Protected)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching admins',
      error: error.message,
    });
  }
};

// @desc    Get single admin
// @route   GET /api/admin/:id
// @access  Private (Protected)
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching admin',
      error: error.message,
    });
  }
};

// @desc    Get admins created by a specific admin
// @route   GET /api/admin/created-by/:adminId
// @access  Private (Protected)
exports.getAdminsByCreatedBy = async (req, res) => {
  try {
    // createdBy is now an object { id, name, email }
    const admins = await Admin.find({ 'createdBy.id': req.params.adminId }).select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching admins',
      error: error.message,
    });
  }
};

// @desc    Update Admin
// @route   PUT /api/admin/:id
// @access  Private (Protected)
exports.updateAdmin = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    if (fullName) admin.fullName = fullName;
    if (email) {
      const existingEmail = await Admin.findOne({ email, _id: { $ne: req.params.id } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      admin.email = email;
    }

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating admin',
      error: error.message,
    });
  }
};

// @desc    Delete Admin
// @route   DELETE /api/admin/:id
// @access  Private (Protected)
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting admin',
      error: error.message,
    });
  }
};

// @desc    Deactivate Admin
// @route   PUT /api/admin/:id/deactivate
// @access  Private (Protected)
exports.deactivateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin deactivated successfully',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deactivating admin',
      error: error.message,
    });
  }
};

// @desc    Activate Admin
// @route   PUT /api/admin/:id/activate
// @access  Private (Protected)
exports.activateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true, runValidators: true }
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin activated successfully',
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error activating admin',
      error: error.message,
    });
  }
};
