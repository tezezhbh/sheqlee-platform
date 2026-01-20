const mongoose = require('mongoose');
const slugify = require('slugify');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is must.'],
      trim: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobCategory',
      required: [true, 'A tag must belong to a category.'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'You must tell us who created the tag.'],
    },
  },
  { timestamps: true }
);

tagSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
