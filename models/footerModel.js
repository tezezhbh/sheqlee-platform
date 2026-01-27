const mongoose = require('mongoose');

const footerSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, 'The Section or Key is needed.'],
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'The Content Value is needed'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Footer = mongoose.model('Footer', footerSchema);

module.exports = Footer;
