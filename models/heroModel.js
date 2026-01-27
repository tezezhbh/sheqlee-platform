const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, 'The Section or Key is needed.'],
      unique: true,
      trim: true,
      // examples: title, description, animation
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

const Hero = mongoose.model('Hero', heroSchema);

module.exports = Hero;
