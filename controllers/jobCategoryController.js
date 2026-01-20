const JobCategory = require('../models/jobCategoryModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');

const getCategoryOrFail = async (categoryId) => {
  const category = await JobCategory.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
};

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await JobCategory.create({
    name,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Category created successfully',
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await getCategoryOrFail(categoryId);

  const allowedFields = ['name', 'description', 'isActive'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  await category.save();

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully',
    data: {
      category,
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
    // Lookup Tags linked to this Category
    {
      $lookup: {
        from: 'tags',
        localField: '_id',
        foreignField: 'category',
        as: 'tags',
      },
    },

    // Lookup Jobs linked to this Category
    {
      $lookup: {
        from: 'jobposts',
        localField: '_id',
        foreignField: 'category',
        as: 'jobs',
      },
    },

    // Lookup Registered Followers (Follows)
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

    // Lookup Email Subscriptions
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

    // Project and Calculate Final Counts
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        isActive: 1,
        createdAt: 1,
        // Count the tags array
        tagsCount: { $size: '$tags' },

        // Count only jobs that are actually active/published
        jobsCount: {
          $size: {
            $filter: {
              input: '$jobs',
              as: 'job',
              cond: { $eq: ['$$job.isPublished', true] },
            },
          },
        },

        // Sum of registered follows + email subscriptions
        subscribersCount: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$follows.count', 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ['$emailSubs.count', 0] }, 0] },
          ],
        },
      },
    },

    // Default Sort (Newest first)
    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
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
