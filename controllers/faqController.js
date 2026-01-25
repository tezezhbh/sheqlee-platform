const FAQ = require('./../models/faqModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.create({
    question: req.body.question,
    answer: req.body.answer,
    audience: req.body.audience,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: faq,
  });
});

exports.getAllFAQs = catchAsync(async (req, res, next) => {
  const faqs = await FAQ.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: faqs,
  });
});

exports.getPublicFAQs = catchAsync(async (req, res, next) => {
  const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: faqs,
  });
});

exports.getFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) return next(new AppError('FAQ not found', 404));

  res.status(200).json({
    status: 'success',
    data: faq,
  });
});

exports.updateFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!faq) return next(new AppError('FAQ not found', 404));

  res.status(200).json({
    status: 'success',
    data: faq,
  });
});

exports.toggleFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) return next(new AppError('FAQ not found', 404));

  faq.isActive = !faq.isActive;
  await faq.save();

  res.status(200).json({
    status: 'success',
    data: faq,
  });
});

exports.deleteFAQ = catchAsync(async (req, res, next) => {
  const faq = await FAQ.findByIdAndDelete(req.params.id);

  if (!faq) return next(new AppError('FAQ not found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
