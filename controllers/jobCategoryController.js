const JobCategory = require('../models/jobCategoryModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');

const getCategoryOrFail = async (categoryId) => {
  const category = await JobCategory.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }
  return category;
};

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const category = await JobCategory.create({
    name,
    description,
    createdBy: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Category created successfully',
    data: {
      category,
    },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await getCategoryOrFail(categoryId);

  const allowedFields = ['name', 'description', 'isActive'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      category[field] = req.body[field];
    }
  });

  await category.save();

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully',
    data: {
      category,
    },
  });
});

exports.toggleCategoryStatus = catchAsync(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await getCategoryOrFail(categoryId);

  // Toggle the category’s active status.
  category.isActive = !category.isActive;
  await category.save();

  res.status(200).json({
    status: 'success',
    message: `Category ${
      category.isActive ? 'enabled' : 'disabled'
    } successfully`,
    data: {
      category,
    },
  });
});

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await JobCategory.find({ isActive: true })
    .select('name slug description')
    .sort({
      name: 1,
    });

  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: {
      categories,
    },
  });
});

exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const category = await JobCategory.findOne({
    slug,
    isActive: true,
  });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      category,
    },
  });
});
