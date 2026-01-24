const Feedback = require('../models/feedbackModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

exports.createFeedback = catchAsync(async (req, res, next) => {
  // 1. Destructure from body - ensuring 'name' is included for guests
  const { subject, message, email, name: bodyName } = req.body;

  let name;
  let userId = null;

  // Determine the sender's identity
  if (req.user) {
    name = req.user.name;
    userId = req.user._id;
  } else {
    // If not logged in, we MUST have a name from the body for the Admin UI
    name = bodyName || 'Guest User';
  }

  // 2. SPAM PROTECTION (Rate Limiting)
  const timeLimit = new Date(Date.now() - 60 * 60 * 1000);

  // Look for exact same message from same person in the the
  const duplicateQuery = {
    message,
    $or: [{ email: email }, { name: name }],
    createdAt: { $gte: timeLimit },
  };

  const existingFeedback = await Feedback.findOne(duplicateQuery);

  if (existingFeedback) {
    return next(
      new AppError('Please wait before sending the same feedback again.', 429),
    );
  }

  // 3. CREATE FEEDBACK
  const feedback = await Feedback.create({
    user: userId,
    name,
    email,
    subject,
    message,
  });

  res.status(201).json({
    status: 'success',
    data: { feedback },
  });
});

exports.getAllFeedbacks = catchAsync(async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: feedbacks.length,
    data: {
      feedbacks,
    },
  });
});

exports.getFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      feedback,
    },
  });
});

exports.hardDeleteFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Feedback permanently deleted',
  });
});

exports.toggleFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) return next(new AppError('Feedback not found', 404));

  feedback.isActive = !feedback.isActive;
  await feedback.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      active: feedback.isActive,
    },
  });
});
