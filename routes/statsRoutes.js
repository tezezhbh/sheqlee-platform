const express = require('express');
const statsController = require('../controllers/statsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.authorizedTo('admin'));

router.get('/jobs', statsController.getJobStats);
router.get('/companies', statsController.getCompanyStats);
router.get('/users', statsController.getFreelancerStats);
router.get('/subscribers', statsController.getEmailAlertStats);

module.exports = router;
