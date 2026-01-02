const express = require('express');
const jobCategoryController = require('../controllers/jobCategoryController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', jobCategoryController.getAllCategories);
router.get('/:slug', jobCategoryController.getCategoryBySlug);

// Protected routes
router.use(authController.protect, authController.authorizedTo('admin'));

// later will add authorzedTo('admin')
router.post('/', jobCategoryController.createCategory);
router.patch('/:categoryId', jobCategoryController.updateCategory);
router.patch('/:categoryId/toggle', jobCategoryController.toggleCategoryStatus);

module.exports = router;
