const crypto = require('crypto');
const Subscription = require('../models/subscriptionModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

exports.subscribe = catchAsync(async (req, res, next) => {
  const { email, targetType, targetId } = req.body;

  if (!email || !targetType || !targetId) {
    return next(new AppError('Missing required fields', 400));
  }

  const unsubscribeToken = crypto.randomBytes(32).toString('hex');
  // console.log(unsubscribeToken);

  const existing = await Subscription.findOne({
    email,
    targetType,
    target: targetId,
    // isActive: true,
    // unsubscribeToken,
    // unsubscribedAt: { $exists: false },
  });

  // if (existing) {
  //   return next(new AppError('Already subscribed', 400));
  // }

  if (existing && existing.isActive) {
    return next(new AppError('Already subscribed', 400));
  }

  // Exists but inactive → REACTIVATE
  if (existing && !existing.isActive) {
    existing.isActive = true;
    existing.unsubscribedAt = undefined;
    existing.unsubscribeToken = unsubscribeToken;
    await existing.save();

    return res.status(200).json({
      status: 'success',
      message: 'You have Resubscribed successfully',
    });
  }

  const subscription = await Subscription.create({
    email,
    targetType,
    target: targetId,
    unsubscribeToken,
    isActive: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

exports.unsubscribe = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const subscription = await Subscription.findOne({
    unsubscribeToken: token,
    // unsubscribedAt: { $exists: false },
  });

  if (!subscription) {
    return next(
      new AppError('Already unsubscribed or something is wrong!', 400)
    );
  }

  subscription.unsubscribedAt = Date.now();
  subscription.unsubscribeToken = undefined;
  subscription.isActive = false;
  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'You have been unsubscribed successfully',
  });
});
