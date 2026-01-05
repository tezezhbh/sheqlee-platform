const { body } = require('express-validator');

exports.companyRegisterValidator = [
  // Company info
  body('company.name').notEmpty().withMessage('Company name is required'),

  body('company.domain')
    .optional()
    .isURL()
    .withMessage('Company domain must be a valid URL'),

  // Representative info
  body('representative.full_name')
    .notEmpty()
    .withMessage('Representative full name is required'),

  body('representative.email').isEmail().withMessage('Valid email is required'),

  body('representative.password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('representative.passwordConfirm')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.representative.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

exports.createCompanyValidator = [
  body('name').notEmpty().withMessage('Company name is required'),

  body('domain')
    .optional()
    .isURL()
    .withMessage('Company domain must be a valid URL'),
];

exports.signupValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),

  body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];
