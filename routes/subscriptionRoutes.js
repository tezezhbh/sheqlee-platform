const express = require('express');
const authController = require('../controllers/authController');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/subscribe', subscriptionController.subscribe);
router.post('/unsubscribe/:token', subscriptionController.unsubscribe);

module.exports = router;
