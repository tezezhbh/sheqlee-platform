const express = require('express');
const freelancerProfileController = require('../controllers/freelancerProfileController');
const authController = require('../controllers/authController');
const handlerFactory = require('./../controllers/handlerFactory');
const User = require('../models/userModel');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router
  .route('/')
  .post(freelancerProfileController.upsertProfile)
  .patch(freelancerProfileController.upsertProfile)
  .get(
    authController.authorizedTo('admin'),
    freelancerProfileController.getAllFreelancers
  );

router.patch(
  '/profile-visibility',
  freelancerProfileController.toggleVisibility
);

router.use(authController.restrictedToAccountType('professional'));

router.post('/skills', freelancerProfileController.addSkill);
// router.patch('/skills/:skillId', freelancerProfileController.updateSkill);
router.delete('/skills', freelancerProfileController.removeSkill);

router.post('/links', freelancerProfileController.addLink);
router.delete('/links', freelancerProfileController.removeLink);

router.patch(
  '/:id/toggle',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.toggleStatus(User)
);

router.delete(
  '/:id',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.deleteOne(User)
);

module.exports = router;
