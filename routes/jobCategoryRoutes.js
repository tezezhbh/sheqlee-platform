const express = require('express');
const jobCategoryController = require('../controllers/jobCategoryController');
const authController = require('../controllers/authController');
const handlerFactory = require('./../controllers/handlerFactory');
const JobCategory = require('../models/jobCategoryModel');

const router = express.Router();

// Public routes
router.get('/', jobCategoryController.getAllCategories);
router.get('/:slug', jobCategoryController.getCategoryBySlug);

// Protected routes
router.use(authController.protect, authController.authorizedTo('admin'));

// later will add authorzedTo('admin')
router.post('/', jobCategoryController.createCategory);
router.patch('/:categoryId', jobCategoryController.updateCategory);
// router.patch('/:categoryId/toggle', jobCategoryController.toggleCategoryStatus);

router.patch(
  '/:id/toggle',
  //   authController.protect,
  //   authController.authorizedTo('admin'),
  handlerFactory.toggleActive(JobCategory)
);

router.delete(
  '/:id',
  //   authController.protect,
  //   authController.authorizedTo('admin'),
  handlerFactory.deleteOne(JobCategory)
);

module.exports = router;
