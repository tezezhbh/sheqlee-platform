const Testimonial = require('../models/testimonialModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

exports.createTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.create({
    ...req.body,
    createdBy: req.user?.id, // if you use auth
  });

  res.status(201).json({
    status: 'success',
    data: {
      testimonial,
    },
  });
});

exports.getAllTestimonials = catchAsync(async (req, res, next) => {
  const testimonials = await Testimonial.find().sort('order');

  res.status(200).json({
    status: 'success',
    results: testimonials.length,
    data: {
      testimonials,
    },
  });
});

exports.getPublicTestimonials = catchAsync(async (req, res, next) => {
  const testimonials = await Testimonial.find({
    isActive: true,
  })
    .sort('order')
    .select('company logo testimony companyRep position isActive');

  res.status(200).json({
    status: 'success',
    results: testimonials.length,
    data: {
      testimonials,
    },
  });
});

exports.getTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('Testimonial not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      testimonial,
    },
  });
});

exports.updateTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  if (!testimonial) return next(new AppError('Testimonial not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      testimonial,
    },
  });
});

exports.deleteTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

  if (!testimonial) return next(new AppError('Testimonial not found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.toggleTestimonialStatus = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id).select(
    'company isActive',
  );

  if (!testimonial) return next(new AppError('Testimonial not found', 404));

  testimonial.isActive = !testimonial.isActive;
  await testimonial.save();

  res.status(200).json({
    status: 'success',
    data: {
      testimonial,
    },
  });
});
