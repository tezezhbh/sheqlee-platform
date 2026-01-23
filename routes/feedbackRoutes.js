const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get(
  '/',
  authController.protect,
  authController.authorizedTo('admin'),
  feedbackController.getAllFeedbacks,
);
router.get(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  feedbackController.getFeedback,
);
router.patch(
  '/:id/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  feedbackController.toggleFeedback,
);

router.delete(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  feedbackController.hardDeleteFeedback,
);

module.exports = router;
