const express = require('express');
const testimonialController = require('./../controllers/testimonialController');
const authController = require('./../controllers/authController');
const multer = require('./../utilities/multer');

const router = express.Router();

router.get('/public', testimonialController.getPublicTestimonials);

router.use(authController.protect, authController.authorizedTo('admin'));

router
  .route('/')
  .get(testimonialController.getAllTestimonials)
  .post(
    multer.uploadImage.single('logo'),
    testimonialController.createTestimonial,
  );

router
  .route('/:id')
  .get(testimonialController.getTestimonial)
  .patch(testimonialController.updateTestimonial)
  .delete(testimonialController.deleteTestimonial);

router.patch(
  '/:id/logo',
  multer.uploadImage.single('logo'),
  testimonialController.updateTestimonialLogo,
);
router.patch('/:id/toggle', testimonialController.toggleTestimonialStatus);

module.exports = router;
