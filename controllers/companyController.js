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
    return next(new AppError('Email already in use', 409));
  }

  const existingCompany = await Company.findOne({ name: company.name });
  if (existingCompany) {
    return next(new AppError('Company already exists', 409));
  }

  const hashedPassword = await bcrypt.hash(representative.password, 12);

  const user = await User.create({
    name: representative.full_name,
    email: representative.email,
    password: hashedPassword,
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
