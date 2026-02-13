const JobCategory = require('../models/jobCategoryModel');
const Tag = require('./../models/tagModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');
const { uploadToCloudinary } = require('./../utilities/cloudinaryUpload');
const cloudinary = require('./../config/cloudinary');

exports.updateCategoryIcon = catchAsync(async (req, res, next) => {
  const category = await JobCategory.findById(req.params.id);

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an icon', 400));
  }

  // Remove old icon
  if (category.icon?.publicId) {
    await cloudinary.uploader.destroy(category.icon.publicId);
  }

  const result = await uploadToCloudinary({
    buffer: req.file.buffer,
    folder: 'categories/icons',
    publicId: `category-${category._id}`,
  });

  category.icon = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await category.save();

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

const getCategoryOrFail = async (categoryId) => {
  const category = await JobCategory.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
};

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, tags } = req.body;

  const result = await uploadToCloudinary({
    buffer: req.file.buffer,
    folder: 'categories/icons',
    publicId: `category-${Date.now()}`,
  });

  // 1. Create the Category
  const category = await JobCategory.create({
    name,
    description,
    tags: tags || [], // Save the tags selected in the dropdown
    createdBy: req.user._id,
    icon: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // 2. BI-DIRECTIONAL SYNC: Update the Tag documents
  if (tags && tags.length > 0) {
    await Tag.updateMany(
      { _id: { $in: tags } },
      { $addToSet: { categories: category._id } }, // Add this Category to the Tag's list
    );
  }

  res.status(201).json({
    status: 'success',
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;
  const category = await getCategoryOrFail(categoryId);

  // Store the original tags to calculate what was removed
  const oldTags = category.tags.map((id) => id.toString());

  // 1. Update basic fields
  const allowedFields = ['name', 'description', 'isActive', 'tags'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  const updatedCategory = await category.save({ validateBeforeSave: false });

  // 2. SYNC LOGIC: If the tags array was modified
  if (req.body.tags) {
    const newTags = req.body.tags.map((id) => id.toString());

    // A. Remove Category ID from tags that were deselected
    const removedTags = oldTags.filter((id) => !newTags.includes(id));
    await Tag.updateMany(
      { _id: { $in: removedTags } },
      { $pull: { categories: updatedCategory._id } },
    );

    // B. Add Category ID to newly selected tags
    await Tag.updateMany(
      { _id: { $in: newTags } },
      { $addToSet: { categories: updatedCategory._id } },
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      category: updatedCategory,
    },
  });
});

exports.toggleCategoryStatus = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await getCategoryOrFail(categoryId);

  // Toggle the category’s active status.
  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    status: 'success',
    message: `Category ${
      category.isActive ? 'enabled' : 'disabled'
    } successfully`,
    data: {
      category,
    },
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await JobCategory.aggregate([
    // 1. Lookup Jobs linked to this Category
    {
      $lookup: {
        from: 'jobposts',
        localField: '_id',
        foreignField: 'category',
        as: 'jobs',
      },
    },

    // 2. Lookup Registered Followers
    {
      $lookup: {
        from: 'follows',
        let: { catId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$catId'] },
                  { $eq: ['$targetType', 'JobCategory'] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'follows',
      },
    },

    // 3. Lookup Email Subscriptions
    {
      $lookup: {
        from: 'subscriptions',
        let: { catId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$catId'] },
                  { $eq: ['$targetType', 'JobCategory'] },
                  { $eq: ['$isActive', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'emailSubs',
      },
    },

    // 4. Project and Calculate Final Counts
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
        // NEW: Just count the array already stored in the document
        tagsCount: { $size: { $ifNull: ['$tags', []] } },

        // UPDATED: Count jobs where status is 'published'
        jobsCount: {
          $size: {
            $filter: {
              input: '$jobs',
              as: 'job',
              cond: { $eq: ['$$job.status', 'published'] },
            },
          },
        },

        subscribersCount: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$follows.count', 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ['$emailSubs.count', 0] }, 0] },
          ],
        },
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
});

exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const category = await JobCategory.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});
