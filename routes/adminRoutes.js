const express = require('express');
const adminController = require('./../controllers/adminController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post(
  '/invite-user',
  authController.protect,
  authController.authorizedTo('admin'),
  adminController.inviteUser
);

module.exports = router;
