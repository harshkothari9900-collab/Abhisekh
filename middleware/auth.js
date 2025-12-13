const jwt = require('jsonwebtoken');
const Admin = require('../Models/Admin');

module.exports = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select('-password');

      if (admin) {
        // attach minimal admin info to request
        req.admin = { id: admin._id, fullName: admin.fullName, email: admin.email };
      }
    } catch (error) {
      // ignore invalid token
    }
  }

  next();
};
