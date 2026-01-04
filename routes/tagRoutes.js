const express = require('express');
const authController = require('./../controllers/authController');
const tagController = require('./../controllers/tagController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.authorizedTo('admin'),
    tagController.createTag
  )
  .get(tagController.getAllTags);

router.patch(
  '/:tagId',
  authController.protect,
  authController.authorizedTo('admin'),
  tagController.updateTag
);

router.patch(
  '/:tagId/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  tagController.toggleTag
);

module.exports = router;
