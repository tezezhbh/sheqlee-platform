const bcrypt = require('bcrypt');
const User = require('./../models/userModel');
const Company = require('./../models/companyModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.companyRegister = catchAsync(async (req, res, next) => {
  const { company, representative } = req.body;

  if (!company || !representative) {
    return next(
      new AppError('Company and representative information are required', 400),
    );
  }

  const existingUser = await User.findOne({ email: representative.email });
  if (existingUser) {
    return next(
      new AppError(
        'Email already in use please login useing your email for more inf0.',
        409,
      ),
    );
  }

  const existingCompany = await Company.findOne({ name: company.name });
  if (existingCompany) {
    return next(new AppError('Company already exists', 409));
  }

  //   const hashedPassword = await bcrypt.hash(representative.password, 12);

  const user = await User.create({
    name: representative.full_name,
    email: representative.email,
    password: representative.password,
    // passwordConfirm: representative.passwordConfirm,
    role: 'user',
    accountType: 'employer',
  });

  const newCompany = await Company.create({
    name: company.name,
    domain: company.domain,
    owner: user._id,
  });

  return res.status(201).json({
    success: true,
    message: 'Company registered successfully',
    data: {
      owner: user._id,
      company: newCompany._id,
    },
  });
});

exports.createCompany = catchAsync(async (req, res, next) => {
  const { name, domain } = req.body;

  // Optional: prevent duplicate company names per user
  const existingCompany = await Company.findOne({
    name,
    owner: req.user._id,
  });

  if (existingCompany) {
    return next(new AppError('You already own a company with this name', 409));
  }

  const company = await Company.create({
    name,
    domain,
    owner: req.user._id,
  });

  res.status(201).json({
    staaus: 'success',
    message: 'Company created successfully',
    data: {
      company,
    },
  });
});

exports.getAllCompanies = catchAsync(async (req, res, next) => {
  const companies = await Company.aggregate([
    // Lookup the Owner (Replacing the old .populate('owner'))
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerInfo',
      },
    },

    {
      $lookup: {
        from: 'jobposts',
        localField: '_id',
        foreignField: 'company',
        as: 'jobs',
      },
    },

    {
      $lookup: {
        from: 'follows',
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$companyId'] },
                  { $eq: ['$targetType', 'Company'] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'follows',
      },
    },

    {
      $lookup: {
        from: 'subscriptions',
        let: { companyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$target', '$$companyId'] },
                  { $eq: ['$targetType', 'Company'] },
                  { $eq: ['$isActive', true] },
                ],
              },
            },
          },
          { $count: 'count' },
        ],
        as: 'emailSubs',
      },
    },

    // Final Shape for the Dashboard Table
    {
      $project: {
        name: 1,
        email: 1,
        status: 1,
        description: 1,
        createdAt: 1,
        companyId: 1,
        // Get the first owner from the array created by lookup
        owner: { $arrayElemAt: ['$ownerInfo', 0] },
        jobsCount: {
          $size: {
            $filter: {
              input: '$jobs',
              as: 'job',
              cond: { $eq: ['$$job.status', 'published'] },
            },
          },
        },
        subsCount: {
          $add: [
            { $ifNull: [{ $arrayElemAt: ['$follows.count', 0] }, 0] },
            { $ifNull: [{ $arrayElemAt: ['$emailSubs.count', 0] }, 0] },
          ],
        },
      },
    },

    { $sort: { createdAt: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    results: companies.length,
    data: {
      companies,
    },
  });
});

exports.getCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.companyId)
    // .populate('')
    .populate('owner', 'name email');

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      company,
    },
  });
});

exports.getMyCompanyProfile = catchAsync(async (req, res, next) => {
  const company = await Company.find({
    owner: req.user._id,
  });

  // only for one findOne()
  // if (!company) {
  //   return next(new AppError('Conpamy not found!', 404));
  // }
  if (company.length === 0) {
    return next(new AppError('No companies found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    results: company.length,
    data: {
      company,
    },
  });
});

exports.updateMyCompanyProfile = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'name',
    'domain',
    'description',
    'companySize',
    'location',
  ];

  const filteredBody = {};
  allowedFields.forEach((el) => {
    if (req.body[el] !== undefined) filteredBody[el] = req.body[el];
  });

  const updatedCompany = await Company.findOneAndUpdate(
    { owner: req.user._id },
    filteredBody,
    { new: true, runValidators: true },
  );

  if (!updatedCompany) {
    return next(new AppError('Company not found!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Company updated successfully',
    data: updatedCompany,
  });
});

// DELETE COMPANY???????
// deletedAt: Date,
// deleteReason: String,
// isActive: {type: boolean, default: true}
