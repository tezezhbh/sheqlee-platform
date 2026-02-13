const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      maxlength: 256,
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: Number,
          min: 1,
          max: 5,
        },
      },
    ],
    links: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    cv: {
      url: String,
      publicId: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

const FreelancerProfile = mongoose.model(
  'FreelancerProfile',
  freelancerProfileSchema,
);

module.exports = FreelancerProfile;
