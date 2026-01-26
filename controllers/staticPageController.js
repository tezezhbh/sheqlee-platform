const StaticPage = require('./../models/staticPageModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createPage = catchAsync(async (req, res, next) => {
  const { page, content } = req.body;

  const lastVersion = await StaticPage.findOne({ page })
    .sort({ version: -1 })
    .select('version');

  const version = lastVersion ? lastVersion.version + 1 : 1;

  const newPage = await StaticPage.create({
    page,
    version,
    content,
    updatedBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newPage,
    },
  });
});

exports.getPagesAdmin = catchAsync(async (req, res) => {
  const pages = await StaticPage.find()
    .populate('updatedBy', 'name')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    status: 'success',
    results: pages.length,
    data: {
      pages,
    },
  });
});

exports.getPageVersion = catchAsync(async (req, res, next) => {
  const page = await StaticPage.findById(req.params.id)
    .populate('updatedBy', 'name')
    .select('page version isActive');

  if (!page) return next(new AppError('Page not found', 404));

  res.status(200).json({
    status: 'success',
    data: {
      page,
    },
  });
});

exports.getPublicPage = catchAsync(async (req, res, next) => {
  const { pageType } = req.params;
  const { v } = req.query; // Get version from query string if it exists

  let query = { page: pageType };

  // 1. Logic for the Version Dropdown
  if (v) {
    query.version = Number(v);
    if (isNaN(v)) {
      return next(new AppError('Invalid version Input', 400));
    }
  } else {
    // Default: Get the latest active version for the public
    query.isActive = true;
  }

  const page = await StaticPage.findOne(query);

  if (!page) {
    return next(new AppError('This page content can not be found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      page,
    },
  });
});

// Toggle(activate) only one version
exports.activatePageVersion = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const pageDoc = await StaticPage.findById(id);
  if (!pageDoc) return next(new AppError('Page not found', 404));

  // Deactivate all versions of this page
  await StaticPage.updateMany({ page: pageDoc.page }, { isActive: false });

  // Activate selected version
  pageDoc.isActive = true;
  await pageDoc.save();

  res.status(200).json({
    status: 'success',
    data: {
      pageDoc,
    },
  });
});

exports.deletePageVersion = catchAsync(async (req, res, next) => {
  const page = await StaticPage.findByIdAndDelete(req.params.id);

  if (!page) return next(new AppError('Page not found', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
