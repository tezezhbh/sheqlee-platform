const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const { createCompanyValidator } = require('../validators/comRegValidator');
const validateRequest = require('../myMiddlewares/validateRequest');

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
  companyController.getCompany
);
router.get(
  '/:companyId/jobs/stats',
  authController.protect,
  authController.restrictedToAccountType('employer'),
  jobController.getCompanyJobStats
);

router
  .route('/')
  .post(
    authController.protect,
    createCompanyValidator,
    validateRequest,
    companyController.createCompany
  )
  .get(
    // authController.protect,
    // authController.authorizedTo('admin'),
    companyController.getAllCompanies
  );

module.exports = router;
