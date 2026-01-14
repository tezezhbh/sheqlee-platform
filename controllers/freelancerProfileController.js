const FreelancerProfile = require('../models/freelancerProfileModel');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

exports.upsertProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (req.user.accountType !== 'professional') {
    return next(
      new AppError('Only professional users can create profiles', 403)
    );
  }

  const allowedFields = ['title', 'bio', 'skills', 'links', 'isPublic'];
  const filteredBody = {};
  allowedFields.forEach((el) => {
    if (req.body[el] !== undefined) filteredBody[el] = req.body[el];
  });

  const profile = await FreelancerProfile.findOneAndUpdate(
    { user: userId },
    { ...filteredBody, user: userId },
    {
      new: true,
      upsert: true, // create if not exists
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      profile,
    },
  });
});

// Visiblity of a Profile
exports.toggleVisibility = catchAsync(async (req, res, next) => {
  const profile = await FreelancerProfile.findOne({ user: req.user._id });

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  profile.isPublic = !profile.isPublic;
  await profile.save();

  res.status(200).json({
    status: 'success',
    data: {
      isPublic: profile.isPublic,
    },
  });
});

// Get all freelancers by Admin
exports.getAllFreelancers = catchAsync(async (req, res, next) => {
  const freelancers = await User.aggregate([
    {
      $match: {
        accountType: 'professional',
      },
    },
    {
      $lookup: {
        from: 'freelancerprofiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    },
    {
      $unwind: {
        path: '$profile',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        createdAt: 1,
        active: 1,
        title: '$profile.title',
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: freelancers.length,
    data: freelancers,
  });
});

////////////////////////////////////////////////
exports.addSkill = catchAsync(async (req, res, next) => {
  const { name, level } = req.body;
  const userId = req.user.id;

  // 1. Validation
  if (!name || !level)
    return next(new AppError('Skill and level are required', 400));
  if (level < 1 || level > 5)
    return next(new AppError('Level must be 1-5', 400));

  const normalizedName = name.trim().replace(/\s+/g, ' ');

  // 2. Atomic Update: Check for duplicate AND push in one go
  // We search for the profile where the skill name DOES NOT already exist
  const profile = await FreelancerProfile.findOneAndUpdate(
    {
      user: userId,
      'skills.name': { $ne: normalizedName }, // "Not Equal" - prevents duplicates
    },
    {
      $push: { skills: { name: normalizedName, level } },
    },
    { new: true, runValidators: true }
  );

  // 3. If profile is null, it means either profile doesn't exist OR skill is a duplicate
  if (!profile) {
    // check if profile exists to give a specific "Duplicate" error
    return next(new AppError('Skill already exists or profile not found', 400));
  }

  res.status(200).json({
    status: 'success',
    data: { skills: profile.skills },
  });
});

// Remove Skills
exports.removeSkill = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return next(new AppError('Skill name is required', 400));
  }

  const normalizedName = name.trim().replace(/\s+/g, ' ');

  const profile = await FreelancerProfile.findOneAndUpdate(
    { user: userId },
    { $pull: { skills: { name: normalizedName } } },
    { new: true }
  );

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { skills: profile.skills },
  });
});

//////////////////ADD LINK
exports.addLink = catchAsync(async (req, res, next) => {
  const { name, url } = req.body;
  const userId = req.user.id;

  // 1. Validation
  if (!name || !url) {
    return next(new AppError('Link name and URL are required', 400));
  }

  const normalizedName = name.trim().replace(/\s+/g, ' ');

  // 2. Atomic update and duplicate protection
  const profile = await FreelancerProfile.findOneAndUpdate(
    {
      user: userId,
      'links.name': { $ne: normalizedName }, // prevent duplicate link names
    },
    {
      $push: {
        links: {
          name: normalizedName,
          url: url.trim(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!profile) {
    return next(new AppError('Link already exists or profile not found', 400));
  }

  res.status(201).json({
    status: 'success',
    data: {
      links: profile.links,
    },
  });
});

exports.removeLink = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return next(new AppError('Link name is required', 400));
  }

  const normalizedName = name.trim().replace(/\s+/g, ' ');

  const profile = await FreelancerProfile.findOneAndUpdate(
    { user: userId },
    { $pull: { links: { name: normalizedName } } },
    { new: true }
  );

  if (!profile) {
    return next(new AppError('Profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      links: profile.links,
    },
  });
});
