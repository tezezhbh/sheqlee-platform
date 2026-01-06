const express = require('express');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(authController.protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
