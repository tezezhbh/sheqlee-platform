const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const { createCompanyValidator } = require('../validators/comRegValidator');
const validateRequest = require('../myMiddlewares/validateRequest');
const handlerFactory = require('./../controllers/handlerFactory');
const Company = require('../models/companyModel');
const JobPost = require('../models/jobModel');

// const auth = require('../middlewares/auth');

const router = express.Router();

router
  .route('/my-company')
  .get(authController.protect, companyController.getMyCompanyProfile)
  .patch(authController.protect, companyController.updateMyCompanyProfile);

router.get(
  '/:companyId',
  authController.protect,
  authController.authorizedTo('admin'),
  companyController.getCompany,
);
router.get(
  '/:companyId/jobs/stats',
  authController.protect,
  authController.restrictedToAccountType('employer'),
  jobController.getCompanyJobStats,
);

router
  .route('/')
  .post(
    authController.protect,
    createCompanyValidator,
    validateRequest,
    companyController.createCompany,
  )
  .get(
    // authController.protect,
    // authController.authorizedTo('admin'),
    companyController.getAllCompanies,
  );

router.patch(
  '/:id/toggle',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.toggleStatus(Company),
);

router.delete(
  '/:id',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.deleteOne(Company),
);

// Company dashboard (owner monipulating Job)
router.get(
  '/jobs/:companyId/my',
  authController.protect,
  jobController.getMyCompanyJobs,
);
router.post(
  '/:id/duplicate',
  authController.protect,
  jobController.duplicateJob,
);
router.patch(
  '/:id/toggle-owner',
  authController.protect,
  jobController.companyOwnerToggleActive,
);
router.delete('/:id/delete', authController.protect, jobController.deleteJob);

module.exports = router;
