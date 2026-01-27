const express = require('express');
const footerController = require('../controllers/footerController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public
router.get('/public', footerController.getPublicFooter);

// Admin
router.use(authController.protect, authController.authorizedTo('admin'));

router
  .route('/')
  .post(footerController.createFooter)
  .get(footerController.getAllFooters);

router
  .route('/:id')
  .get(footerController.getFooter)
  .patch(footerController.updateFooter)
  .delete(footerController.deleteFooter);

router.patch('/:id/toggle', footerController.toggleFooter);

module.exports = router;
