const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'FAQ is nothing without the targeted Question!'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Please give the relevant answer for the clients!'],
    },
    audience: {
      type: String,
      enum: ['freelancers', 'companies', 'all'],
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
