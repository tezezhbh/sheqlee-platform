const express = require('express');
const faqController = require('./../controllers/faqController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post(
  '/',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.createFAQ,
);
router.get(
  '/',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.getAllFAQs,
);
router.get('/public', faqController.getPublicFAQs);
router.get(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.getFAQ,
);
router.patch(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.updateFAQ,
);
router.patch(
  '/:id/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.toggleFAQ,
);
router.delete(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  faqController.deleteFAQ,
);

module.exports = router;
