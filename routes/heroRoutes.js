const express = require('express');
const heroController = require('./../controllers/heroController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Public
router.get('/public', heroController.getPublicHero);

// Admin
router
  .route('/')
  .post(
    authController.protect,
    authController.authorizedTo('admin'),
    heroController.createHeroSection,
  )
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    heroController.getAllHeroSections,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    heroController.getHeroSection,
  )
  .patch(
    authController.protect,
    authController.authorizedTo('admin'),
    heroController.updateHeroSection,
  )
  .delete(
    authController.protect,
    authController.authorizedTo('admin'),
    heroController.deleteHeroSection,
  );

router.patch(
  '/:id/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  heroController.toggleHeroSection,
);
module.exports = router;
