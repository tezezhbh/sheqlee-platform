const express = require('express');
const jobCategoryController = require('../controllers/jobCategoryController');
const authController = require('../controllers/authController');
const handlerFactory = require('./../controllers/handlerFactory');
const JobCategory = require('../models/jobCategoryModel');
const multer = require('./../utilities/multer');

const router = express.Router();

// Public routes
router.get('/', jobCategoryController.getAllCategories);
router.get('/:slug', jobCategoryController.getCategoryBySlug);

// Protected routes
router.use(authController.protect, authController.authorizedTo('admin'));
router.post(
  '/',
  multer.uploadImage.single('icon'),
  jobCategoryController.createCategory,
);
router.delete('/:id', handlerFactory.deleteOne(JobCategory));
router.patch('/:categoryId', jobCategoryController.updateCategory);
router.patch('/:id/toggle', handlerFactory.toggleActive(JobCategory));
router.patch(
  '/:id/icon',
  multer.uploadImage.single('icon'),
  jobCategoryController.updateCategoryIcon,
);

module.exports = router;
