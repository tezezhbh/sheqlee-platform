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

module.exports = router;
