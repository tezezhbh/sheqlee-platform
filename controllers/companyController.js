const bcrypt = require('bcrypt');
const User = require('./../models/userModel');
const Company = require('./../models/companyModel');
const catchAsync = require('./../utilities/catchAsync');
const AppError = require('./../utilities/globalAppError');

exports.companyRegister = catchAsync(async (req, res, next) => {
  const { company, representative } = req.body;

  if (!company || !representative) {
    return next(
      new AppError('Company and representative information are required', 400)
    );
  }

  const existingUser = await User.findOne({ email: representative.email });
  if (existingUser) {
    return next(
      new AppError(
        'Email already in use please login useing your email for more inf0.',
        409
      )
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
    account_type: 'employer',
  });

  const newCompany = await Company.create({
    name: company.name,
    domain: company.domain,
    owner_id: user._id,
  });

  return res.status(201).json({
    success: true,
    message: 'Company registered successfully',
    data: {
      owner_id: user._id,
      company_id: newCompany._id,
    },
  });
});

exports.createCompany = catchAsync(async (req, res, next) => {
  const { name, domain } = req.body;

  // Optional: prevent duplicate company names per user
  const existingCompany = await Company.findOne({
    name,
    owner_id: req.user._id,
  });

  if (existingCompany) {
    return next(new AppError('You already own a company with this name', 409));
  }

  const company = await Company.create({
    name,
    domain,
    owner_id: req.user._id,
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
  const companies = await Company.find()
    .populate('owner_id', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    results: companies.length,
    data: {
      companies,
    },
  });
});

exports.getCompany = catchAsync(async (req, res, next) => {
  const company = await Company.findById(req.params.companyId).populate(
    'owner_id',
    'name email'
  );

  if (!company) {
    return res.status(404).json({
      success: false,
      message: 'Company not found',
    });
  }

  res.status(200).json({
    success: true,
    data: company,
  });
});

exports.getMyCompanyProfile = catchAsync(async (req, res, next) => {
  const company = await Company.find({
    owner_id: req.user._id,
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
  const updatedCompany = await Company.findOneAndUpdate(
    { owner_id: req.user._id },
    req.body,
    { new: true, runValidators: true }
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
