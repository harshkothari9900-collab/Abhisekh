const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
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



CategorySchema.index(
  { category_name: 1 },
  { unique: true, partialFilterExpression: { category_name: { $exists: true } } }
);

module.exports = mongoose.model('Category', CategorySchema);
