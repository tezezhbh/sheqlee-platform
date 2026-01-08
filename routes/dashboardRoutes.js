const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get(
  '/employer/stats',
  authController.protect,
  authController.restrictedToAccountType('employer'), // employer account_type check
  dashboardController.getEmployerDashboardStats
);

router.use(authController.protect, authController.authorizedTo('admin'));

router.get('/jobs', dashboardController.getJobStats);
router.get('/companies', dashboardController.getCompanyStats);
router.get('/freelancers', dashboardController.getFreelancerStats);
router.get('/email-alerts', dashboardController.getJobAlertStats);

module.exports = router;
