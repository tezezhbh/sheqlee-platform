const Testimonial = require('../models/testimonialModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');
const { uploadToCloudinary } = require('./../utilities/cloudinaryUpload');
const cloudinary = require('./../config/cloudinary');

exports.updateTestimonialLogo = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);

  if (!testimonial) {
    return next(new AppError('Testimonial not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload an icon', 400));
  }

  // Remove old logo
  if (testimonial.icon?.publicId) {
    await cloudinary.uploader.destroy(testimonial.logo.publicId);
  }

  const result = await uploadToCloudinary({
    buffer: req.file.buffer,
    folder: 'testimonials/logos',
    publicId: `testimonial-${testimonial._id}`,
  });

  testimonial.logo = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await testimonial.save();

  res.status(200).json({
    status: 'success',
    data: testimonial,
  });
});

exports.createTestimonial = catchAsync(async (req, res, next) => {
  let logoData = {};

  if (req.file) {
    const result = await uploadToCloudinary({
      buffer: req.file.buffer,
      folder: 'testimonials/logos',
      publicId: `testimonial-${Date.now()}`,
    });

    logoData = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  const testimonial = await Testimonial.create({
    ...req.body,
    createdBy: req.user?.id,
    logo: logoData,
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
