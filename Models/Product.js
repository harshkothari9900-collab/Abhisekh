const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productImage: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null,
      },
      name: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        lowercase: true,
        default: null,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);