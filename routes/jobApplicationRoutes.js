const express = require('express');
const authController = require('../controllers/authController');
const jobApplicationController = require('../controllers/jobApplicationController');
const handlerFactory = require('./../controllers/handlerFactory');
const JobApplication = require('../models/jobApplicationModel');

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

router.delete('/:id', handlerFactory.deleteOne(JobApplication));

module.exports = router;
