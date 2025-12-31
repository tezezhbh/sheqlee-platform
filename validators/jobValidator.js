const { body } = require('express-validator');

exports.createJobValidator = [
  body('company_id').notEmpty().withMessage('Company ID is required'),

  body('title').notEmpty().withMessage('Job title is required'),

  body('description').notEmpty().withMessage('Job description is required'),

  body('employment_type')
    .isIn(['full_time', 'part_time', 'contract', 'remote'])
    .withMessage('Invalid employment type'),
];
