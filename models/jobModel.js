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
    shortDescription: {
      type: String,
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
      enum: ['full_time', 'part_time', 'contract', 'per-diem', 'temporary'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'senior', 'expert'],
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
    requirements: {
      type: String,
      required: [true, 'Please the rquirements for this Job!'],
    },
    skills: {
      type: String,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'ETB',
      },
      unit: {
        type: String,
        enum: ['hour', 'month', 'year'],
      },
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
jobPostSchema.index({
  title: 'text',
  description: 'text',
});

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
