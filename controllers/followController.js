const Follow = require('../models/followModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

exports.follow = catchAsync(async (req, res, next) => {
  const { targetType, targetId } = req.body;

  if (!targetType || !targetId) {
    return next(new AppError('Missing target to follow', 404));
  }

  const follow = await Follow.create({
    user: req.user._id,
    targetType,
    target: targetId,
  });

  res.status(201).json({
    status: 'success',
    data: {
      follow,
    },
  });
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const { targetType, targetId } = req.body;

  const result = await Follow.findOneAndDelete({
    user: req.user._id,
    targetType,
    target: targetId,
  });

  if (!result) {
    return next(new AppError('Follow not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Unfollowed successfully',
  });
});
