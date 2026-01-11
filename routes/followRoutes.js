const express = require('express');
const followController = require('../controllers/followController');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.use(authController.protect);

router.post('/', followController.follow);
router.delete('/unfollow', followController.unfollow);

router.get(
  '/:targetType',
  authController.authorizedTo('admin'),
  dashboardController.getFollowStats
);

module.exports = router;
