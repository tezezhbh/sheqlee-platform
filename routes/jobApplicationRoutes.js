const express = require('express');
const authController = require('../controllers/authController');
const jobApplicationController = require('../controllers/jobApplicationController');

const router = express.Router();

// router.use(authController.protect);

router.get(
  '/my',
  authController.protect,
  jobApplicationController.getMyApplications
);

router.patch(
  '/:applicationId/status',
  authController.protect,
  jobApplicationController.updateApplicationStatus
);

module.exports = router;
