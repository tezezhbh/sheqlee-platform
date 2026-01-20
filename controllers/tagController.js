const Tag = require('./../models/tagModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.create({
    name: req.body.name,
    createdBy: req.user._id,
  });

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
                  { $eq: ['$isPublished', true] },
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

  if (!tag.isActive) {
    return next(new AppError('Cannot update inactive tag', 400));
  }

  tag.name = req.body.name || tag.name;
  await tag.save();

  res.status(200).json({
    status: 'success',
    data: {
      tag,
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
