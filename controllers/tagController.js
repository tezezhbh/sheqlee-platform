const Tag = require('./../models/tagModel');
const JobCategory = require('../models/jobCategoryModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createTag = catchAsync(async (req, res, next) => {
  // 1. Create the Tag with the categories array from the body
  const tag = await Tag.create({
    name: req.body.name,
    description: req.body.description,
    categories: req.body.categories, // Array of IDs from the dropdown
    createdBy: req.user._id,
  });

  // 2. BI-DIRECTIONAL SYNC: Update all selected categories
  if (req.body.categories && req.body.categories.length > 0) {
    await JobCategory.updateMany(
      { _id: { $in: req.body.categories } },
      { $addToSet: { tags: tag._id } }, // Add this Tag ID to the Category's tags array
    );
  }

  res.status(201).json({
    status: 'success',
    data: { tag },
  });
});

exports.getAllPublicTags = catchAsync(async (req, res, next) => {
  const tags = await Tag.aggregate([
    // Count active jobs
    {
      $lookup: {
        from: 'jobposts',
        let: { tagId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$tagId', { $ifNull: ['$tags', []] }] }, // Safety check for null tags
                  { $eq: ['$status', 'published'] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'jobs',
      },
    },

    // Count registered followers
    {
      $lookup: {
        from: 'follows',
        let: { tagId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$tagId'] },
                  { $eq: ['$targetType', 'Tag'] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'follows',
      },
    },

    // Count email subscriptions
    {
      $lookup: {
        from: 'subscriptions',
        let: { tagId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$tagId'] },
                  { $eq: ['$targetType', 'Tag'] },
                  { $eq: ['$isActive', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'subscriptions',
      },
    },

    // Final Projection
    {
      $project: {
        name: 1,
        createdAt: 1,
        isActive: 1,
        // Using $ifNull and $arrayElemAt handles tags with 0 counts perfectly
        jobsCount: { $ifNull: [{ $arrayElemAt: ['$jobs.count', 0] }, 0] },
        subscribersCount: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$follows.count', 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ['$subscriptions.count', 0] }, 0] },
          ],
        },
      },
    },

    { $sort: { subscribersCount: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: tags.length,
    data: { tags },
  });
});

exports.updateTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findById(req.params.tagId);
  if (!tag) return next(new AppError('Tag not found', 404));

  if (!tag.isActive)
    return next(new AppError('Cannot update inactive tag', 400));

  // Store the old categories to compare for syncing
  const oldCategories = tag.categories.map((id) => id.toString());

  // 1. Update the basic fields
  tag.name = req.body.name || tag.name;
  tag.description = req.body.description || tag.description;

  // 2. Update the categories array if provided
  if (req.body.categories) {
    tag.categories = req.body.categories;
  }

  const updatedTag = await tag.save();

  // 3. SYNC BOTH SIDES
  if (req.body.categories) {
    // A. Remove Tag ID from Categories that were deselected
    const removed = oldCategories.filter(
      (id) => !req.body.categories.includes(id),
    );
    await JobCategory.updateMany(
      { _id: { $in: removed } },
      { $pull: { tags: updatedTag._id } },
    );

    // B. Add Tag ID to Categories that were newly added
    await JobCategory.updateMany(
      { _id: { $in: req.body.categories } },
      { $addToSet: { tags: updatedTag._id } },
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      tag: updatedTag,
    },
  });
});

// exports.toggleTag = catchAsync(async (req, res, next) => {
//   const tag = await Tag.findById(req.params.tagId);

//   if (!tag) return next(new AppError('Tag not found', 404));

//   tag.isActive = !tag.isActive;
//   await tag.save({ validateBeforeSave: true });

//   res.status(200).json({
//     status: 'success',
//     data: { tag },
//   });
// });
