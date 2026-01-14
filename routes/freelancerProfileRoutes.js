const express = require('express');
const freelancerProfileController = require('../controllers/freelancerProfileController');
const authController = require('../controllers/authController');

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

module.exports = router;
