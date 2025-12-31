const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
// const auth = require('../middlewares/auth');
const jobController = require('./../controllers/jobController');
const { createJobValidator } = require('../validators/jobValidator');
const validateRequest = require('./../myMiddlewares/validateRequest');

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

module.exports = router;
