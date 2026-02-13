const express = require('express');
const freelancerProfileController = require('../controllers/freelancerProfileController');
const authController = require('../controllers/authController');
const handlerFactory = require('./../controllers/handlerFactory');
const User = require('../models/userModel');
const multer = require('../utilities/multer');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router
  .route('/')
  .post(freelancerProfileController.upsertProfile)
  .patch(freelancerProfileController.upsertProfile)
  .get(
    authController.authorizedTo('admin'),
    freelancerProfileController.getAllFreelancers,
  );

router.patch(
  '/me/cv',
  authController.restrictedToAccountType('professional'),
  multer.uploadCV.single('cv'),
  freelancerProfileController.updateCV,
);

router.patch(
  '/profile-visibility',
  freelancerProfileController.toggleVisibility,
);

router.patch(
  '/:id/toggle',
  authController.authorizedTo('admin'),
  handlerFactory.toggleStatus(User),
);

router.delete(
  '/:id',
  authController.authorizedTo('admin'),
  handlerFactory.deleteOne(User),
);

router.use(authController.restrictedToAccountType('professional'));
router
  .route('/skills')
  .post(freelancerProfileController.addSkill)
  .delete(freelancerProfileController.removeSkill);

router
  .route('/links')
  .post(freelancerProfileController.addLink)
  .delete(freelancerProfileController.removeLink);

module.exports = router;
