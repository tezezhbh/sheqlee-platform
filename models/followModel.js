const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    targetType: {
      type: String,
      enum: ['Company', 'JobCategory', 'Tag'],
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
  },
  { timestamps: true }
);

// prevent duplicate follows
followSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
