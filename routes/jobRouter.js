const express = require('express');

const authController = require('./../controllers/authController');
// const auth = require('../middlewares/auth');
const jobController = require('./../controllers/jobController');
const jobApplicationController = require('./../controllers/jobApplicationController');
const { createJobValidator } = require('../validators/jobValidator');
const validateRequest = require('./../myMiddlewares/validateRequest');

const router = express.Router();

router.get(
  '/company/:companyId/my',
  authController.protect,
  jobController.getMyCompanyJobs
);

router.patch(
  '/:jobId/publish',
  authController.protect,
  jobController.publishJob
);

router.patch(
  '/:jobId/unpublish',
  authController.protect,
  jobController.unpublishJob
);

router.get('/company/:companyId', jobController.getCompanyJobs);

router
  .route('/:jobId')
  .patch(authController.protect, jobController.updateJob)
  // Delete (deactivate) job
  .delete(authController.protect, jobController.deleteJob)
  .get(jobController.getOneJob);

router
  .route('/')
  .post(
    authController.protect,
    createJobValidator,
    validateRequest,
    jobController.createJob
  )
  .get(jobController.getAllPublishedJobs);

router.post(
  '/:jobId/apply',
  authController.protect,
  jobApplicationController.applyToJob
);
router.get(
  '/:jobId/applications',
  authController.protect,
  // authController.restrictedToAccountType('employer'),
  jobApplicationController.getJobApplications
);

module.exports = router;
