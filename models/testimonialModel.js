const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    logo: {
      type: String, // URL or file path
    },
    testimony: {
      type: String,
      required: [true, 'Testimony is required'],
    },
    companyRep: {
      type: String,
      required: [true, 'Company representative name is required'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

testimonialSchema.index(
  { company: 1, companyRep: 1, testimony: 1 },
  { unique: true },
);

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;
