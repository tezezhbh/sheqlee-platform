const User = require('../models/userModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('./../utilities/catchAsync');
const { uploadToCloudinary } = require('./../utilities/cloudinaryUpload');
const cloudinary = require('./../config/cloudinary');

exports.updateProfilePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 1️ Remove old image if exists
  if (user.photo?.publicId) {
    await cloudinary.uploader.destroy(user.photo.publicId);
  }

  // 2️ Upload new image
  const result = await uploadToCloudinary({
    buffer: req.file.buffer,
    folder: 'users/profile',
    publicId: `user-${user._id}`,
  });

  // 3️ Save new image info
  user.photo = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user Found with that Id.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// UPDATE USER
exports.updateUser = catchAsync(async (req, res, next) => {
  // we have to Prevent password updates here
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Update logged-in user
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1️ Block password updates
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // 2️ Allowed fields only
  const allowedFields = ['name', 'email', 'phone'];
  const filteredBody = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // 3️ Update current user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// DELETE USER
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Delete own profile
exports.deleteMe = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return next(new AppError('Deletion reason is required', 400));
  }

  await User.findByIdAndUpdate(req.user._id, {
    status: 'deleted',
    deletedAt: Date.now(),
    deleteReason: reason,
  });

  res.status(204).json({
    status: 'success',
  });
});

// // Middleware to be implemented
// exports.protect = catchAsync(async (req, res, next) => {
//   // existing JWT logic...

//   if (!currentUser.isActive) {
//     return next(new AppError('Your account is deactivated', 401));
//   }

//   next();
// });
