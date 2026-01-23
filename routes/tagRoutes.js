const express = require('express');
const authController = require('./../controllers/authController');
const tagController = require('./../controllers/tagController');
const handlerFactory = require('./../controllers/handlerFactory');
const Tag = require('../models/tagModel');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.authorizedTo('admin'),
    tagController.createTag,
  )
  .get(tagController.getAllPublicTags);

router.patch(
  '/:tagId',
  authController.protect,
  // authController.authorizedTo('admin'),
  tagController.updateTag,
);

// router.patch(
//   '/:tagId/toggle',
//   authController.protect,
//   authController.authorizedTo('admin'),
//   tagController.toggleTag
// );

router.patch(
  '/:id/toggle',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.toggleActive(Tag),
);

router.delete(
  '/:id',
  // authController.protect,
  // authController.authorizedTo('admin'),
  handlerFactory.deleteOne(Tag),
);

module.exports = router;
