const mongoose = require('mongoose');
const slugify = require('slugify');

const jobCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A Category must have a creater'],
    },
  },
  { timestamps: true }
);

// Auto-generate slug
jobCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const JobCategory = mongoose.model('JobCategory', jobCategorySchema);

module.exports = JobCategory;
