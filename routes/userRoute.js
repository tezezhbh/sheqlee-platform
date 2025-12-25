const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = new express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/', userController.getAllUsers);
// router.route('/signup').post(authController.signup); // to chain multiple methods

module.exports = router;
