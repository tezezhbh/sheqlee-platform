const express = require('express');
const authController = require('./../controllers/authController');
const tagController = require('./../controllers/tagController');
const handlerFactory = require('./../controllers/handlerFactory');
const Tag = require('../models/tagModel');
const multer = require('./../utilities/multer');

const router = express.Router();

router.get('/', tagController.getAllPublicTags);

router.use(authController.protect, authController.authorizedTo('admin'));
router.post('/', multer.uploadImage.single('icon'), tagController.createTag);
router.patch('/:tagId', tagController.updateTag);
router.patch('/:id/toggle', handlerFactory.toggleActive(Tag));
router.patch(
  '/:id/icon',
  multer.uploadImage.single('icon'),
  tagController.updateTagIcon,
);

router.delete('/:id', handlerFactory.deleteOne(Tag));

module.exports = router;
