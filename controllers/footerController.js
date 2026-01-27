const Footer = require('./../models/footerModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createFooter = catchAsync(async (req, res, next) => {
  const { section, content } = req.body;

  const footer = await Footer.create({ section, content });

  res.status(201).json({
    status: 'success',
    data: {
      footer,
    },
  });
});

exports.getAllFooters = catchAsync(async (req, res, next) => {
  const footers = await Footer.find()
    .sort('createdAt')
    .select('section content isActive');

  res.status(200).json({
    status: 'success',
    results: footers.length,
    data: {
      footers,
    },
  });
});

exports.getFooter = catchAsync(async (req, res, next) => {
  const footer = await Footer.findById(req.params.id);

  if (!footer) {
    return next(new AppError('Footer is not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      footer,
    },
  });
});

exports.getPublicFooter = catchAsync(async (req, res, next) => {
  const footers = await Footer.find({ isActive: true }).select(
    'section content isActive',
  );

  if (!footers.length) {
    return next(new AppError('Footer content not found', 404));
  }
  res.status(200).json({
    status: 'success',
    results: footers.length,
    data: {
      footers,
    },
  });
});

exports.updateFooter = catchAsync(async (req, res, next) => {
  const footer = await Footer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!footer) return next(new AppError('Footer not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      footer,
    },
  });
});

exports.deleteFooter = catchAsync(async (req, res, next) => {
  const footer = await Footer.findByIdAndDelete(req.params.id);

  if (!footer) return next(new AppError('Footer not found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.toggleFooter = catchAsync(async (req, res, next) => {
  const footer = await Footer.findById(req.params.id).select(
    'section isActive',
  );

  if (!footer) return next(new AppError('Footer not found', 404));

  footer.isActive = !footer.isActive;
  await footer.save();

  res.status(200).json({
    status: 'success',
    data: {
      footer,
    },
  });
});
