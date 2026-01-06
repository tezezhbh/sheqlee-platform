const express = require('express');
const companyController = require('../controllers/companyController');
const authController = require('./../controllers/authController');
const registerationValidator = require('../validators/comRegValidator');
const validateRequest = require('../myMiddlewares/validateRequest');

const router = express.Router();

router.post(
  '/signup',
  registerationValidator.signupValidator,
  validateRequest,
  authController.signup
);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.post('/accept-invite/:token', authController.acceptInvite);
router.patch('/verify-email/:token', authController.verifyEmail);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.get('/logout', authController.protect, authController.logout);

router.post(
  '/company-register',
  registerationValidator.companyRegisterValidator,
  validateRequest,
  companyController.companyRegister
);

module.exports = router;
