const express = require('express');
const testimonialController = require('./../controllers/testimonialController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/public', testimonialController.getPublicTestimonials);

router
  .route('/')
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    testimonialController.getAllTestimonials,
  )
  .post(
    authController.protect,
    authController.authorizedTo('admin'),
    testimonialController.createTestimonial,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    testimonialController.getTestimonial,
  )
  .patch(
    authController.protect,
    authController.authorizedTo('admin'),
    testimonialController.updateTestimonial,
  )
  .delete(
    authController.protect,
    authController.authorizedTo('admin'),
    testimonialController.deleteTestimonial,
  );

router.patch(
  '/:id/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  testimonialController.toggleTestimonialStatus,
);

module.exports = router;
