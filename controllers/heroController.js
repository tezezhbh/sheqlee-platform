const Hero = require('./../models/heroModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.createHeroSection = catchAsync(async (req, res, next) => {
  const { section, content } = req.body;

  const existing = await Hero.findOne({ section });

  if (existing) {
    return next(
      new AppError(
        `Hero section "${section}" already exists. Update it instead.`,
        400,
      ),
    );
  }

  const hero = await Hero.create({ section, content });

  res.status(201).json({
    status: 'success',
    data: {
      hero,
    },
  });
});

exports.getAllHeroSections = catchAsync(async (req, res, next) => {
  const heroes = await Hero.find()
    .sort({ createdAt: 1 })
    .select('section content isActive');

  res.status(200).json({
    status: 'success',
    results: heroes.length,
    data: {
      heroes,
    },
  });
});

exports.getHeroSection = catchAsync(async (req, res, next) => {
  const hero = await Hero.findById(req.params.id);

  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      hero,
    },
  });
});

exports.getPublicHero = catchAsync(async (req, res, next) => {
  const heroes = await Hero.find({ isActive: true }).select(
    'section content isActive',
  );

  if (!heroes.length) {
    return next(new AppError('Hero content not found', 404));
  }

  //   // Convert array to object
  //   const heroData = {};
  //   heroes.forEach((item) => {
  //     heroData[item.section.toLowerCase()] = item.content;
  //   });

  res.status(200).json({
    status: 'success',
    results: heroes.length,
    data: heroes,
  });
});

exports.updateHeroSection = catchAsync(async (req, res, next) => {
  const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      hero,
    },
  });
});

exports.deleteHeroSection = catchAsync(async (req, res, next) => {
  const hero = await Hero.findByIdAndDelete(req.params.id);

  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.toggleHeroSection = catchAsync(async (req, res, next) => {
  const hero = await Hero.findById(req.params.id).select('section isActive');

  if (!hero) {
    return next(new AppError('Hero section not found', 404));
  }

  hero.isActive = !hero.isActive;
  await hero.save();

  res.status(200).json({
    status: 'success',
    data: { hero },
  });
});
