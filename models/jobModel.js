const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    created_by: {
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
    employment_type: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'remote'],
      required: true,
    },
    experience_level: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
    },
    is_published: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobPostSchema.index(
  { company_id: 1, title: 1, is_active: 1 },
  { unique: true }
);

const JobPost = mongoose.model('JobPost', jobPostSchema);

module.exports = JobPost;
