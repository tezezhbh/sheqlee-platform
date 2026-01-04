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

exports.getAllTags = catchAsync(async (req, res) => {
  const tags = await Tag.find({ isActive: true }).sort({ name: 1 });

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

exports.toggleTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findById(req.params.tagId);

  if (!tag) return next(new AppError('Tag not found', 404));

  tag.isActive = !tag.isActive;
  await tag.save();

  res.status(200).json({
    status: 'success',
    data: { tag },
  });
});
