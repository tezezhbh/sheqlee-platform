const mongoose = require('mongoose');

const staticPageSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: [
        'about',
        'pricing',
        'getting-started',
        'privacy-policy',
        'terms-of-service',
        'cookie-policy',
      ],
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String, // HTML or rich text
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Only one active version per page
staticPageSchema.index(
  { page: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);

const StaticPage = mongoose.model('StaticPage', staticPageSchema);

module.exports = StaticPage;
