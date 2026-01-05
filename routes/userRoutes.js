const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = new express.Router();

router
  .route('/:id')
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.authorizedTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.authorizedTo('admin'),
    userController.deleteUser
  );

router.get(
  '/',
  authController.protect,
  authController.authorizedTo('admin'),
  userController.getAllUsers
);

// router.route('/signup').post(authController.signup); // to chain multiple methods

module.exports = router;
