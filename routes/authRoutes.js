const express = require('express');
const companyController = require('../controllers/companyController');
const { companyRegisterValidator } = require('../validators/comRegValidator');
const validateRequest = require('../myMiddlewares/validateRequest');

const router = express.Router();

router.post(
  '/company-register',
  companyRegisterValidator,
  validateRequest,
  companyController.companyRegister
);

module.exports = router;
