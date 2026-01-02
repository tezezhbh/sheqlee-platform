const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'A Job must have a Title.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A Job must have a description.'],
    },
    location: {
      type: String,
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'remote'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCategory',
      required: [true, 'Job category is required'],
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobPostSchema.index({ company: 1, title: 1, isActive: 1 }, { unique: true });

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
