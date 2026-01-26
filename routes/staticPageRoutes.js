const express = require('express');
const staticPageController = require('./../controllers/staticPageController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .post(
    authController.protect,
    authController.authorizedTo('admin'),
    staticPageController.createPage,
  )
  .get(
    authController.protect,
    authController.authorizedTo('admin'),
    staticPageController.getPagesAdmin,
  );

router.get('/:pageType', staticPageController.getPublicPage);

router.get(
  '/admin/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  staticPageController.getPageVersion,
);

router.patch(
  '/:id/toggle',
  authController.protect,
  authController.authorizedTo('admin'),
  staticPageController.activatePageVersion,
);

router.delete(
  '/:id',
  authController.protect,
  authController.authorizedTo('admin'),
  staticPageController.deletePageVersion,
);

module.exports = router;
