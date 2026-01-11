const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribeToken: String,
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

subscriptionSchema.index(
  { email: 1, targetType: 1, target: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
