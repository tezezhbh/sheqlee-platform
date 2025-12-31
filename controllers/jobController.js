const mongoose = require('mongoose');
const JobPost = require('../models/jobModel');
const Company = require('../models/companyModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');

// Get job by ID or throw error
const getJobOrFail = async (jobId) => {
  const job = await JobPost.findById(jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }
  return job;
};

// Check if current user owns the company
const checkCompanyOwnership = async (companyId, userId) => {
  const company = await Company.findById(companyId);

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  if (company.owner_id.toString() !== userId.toString()) {
    throw new AppError('You are not allowed to perform this action', 403);
  }

  return company;
};

exports.createJob = catchAsync(async (req, res, next) => {
  const {
    company_id,
    title,
    description,
    location,
    employment_type,
    experience_level,
    tags,
  } = req.body;

  await checkCompanyOwnership(company_id, req.user._id);

  const existingJob = await JobPost.findOne({
    company_id,
    title,
    is_active: true,
  });

  // preventing duplicate Job Post
  if (existingJob) {
    return next(
      new AppError('A job with this title already exists for this company', 400)
    );
  }

  // 3️) Create job
  const job = await JobPost.create({
    company_id,
    created_by: req.user._id,
    title,
    description,
    location,
    employment_type,
    experience_level,
    tags,
  });

  res.status(201).json({
    status: 'success',
    message: 'Job created successfully',
    data: {
      job,
    },
  });
});

exports.getAllPublishedJobs = catchAsync(async (req, res, next) => {
  const jobs = await JobPost.find({
    is_published: true,
    is_active: true,
  })
    .populate('company_id', 'name domain')
    .sort({ createdAt: -1 });

  // Paginations
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.getOneJob = catchAsync(async (req, res, next) => {
  const job = await JobPost.findOne({
    _id: req.params.jobId,
    is_active: true,
    is_published: true,
  }).populate('company_id', 'name domain');

  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      job,
    },
  });
});

exports.getCompanyJobStats = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  await checkCompanyOwnership(companyId, req.user._id);

  const stats = await JobPost.aggregate([
    // { $match: { company_id: companyId } },
    {
      $match: {
        company_id: new mongoose.Types.ObjectId(companyId),
        is_active: true,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: ['$is_published', 1, 0] },
        },
        active: {
          $sum: { $cond: ['$is_active', 1, 0] },
        },
      },
    },
  ]);

  const result = stats[0] || {
    total: 0,
    published: 0,
    active: 0,
  };

  delete result._id;

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getCompanyJobs = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  const jobs = await JobPost.find({
    company_id: companyId,
    is_published: true,
    is_active: true,
  })
    .populate('company_id', 'name domain')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.getMyCompanyJobs = catchAsync(async (req, res, next) => {
  const { companyId } = req.params;

  //  const job = await getJobOrFail(req.params.jobId, next);
  await checkCompanyOwnership(companyId, req.user._id);

  // 3) Get jobs
  const jobs = await JobPost.find({
    company_id: companyId,
    is_active: true,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

exports.publishJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await getJobOrFail(req.params.jobId);
  await checkCompanyOwnership(job.company_id, req.user._id);

  // 4) Publish
  job.is_published = true;
  await job.save();

  res.status(200).json({
    status: 'success',
    message: 'Job published successfully',
    data: {
      job,
    },
  });
});

exports.unpublishJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await getJobOrFail(req.params.jobId);
  await checkCompanyOwnership(job.company_id, req.user._id);

  job.is_published = false;
  await job.save();

  res.status(200).json({
    status: 'success',
    message: 'Job unpublished successfully',
    data: {
      job,
    },
  });
});

exports.updateJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await getJobOrFail(req.params.jobId);
  await checkCompanyOwnership(job.company_id, req.user._id);

  const allowedFields = [
    'title',
    'description',
    'location',
    'employment_type',
    'experience_level',
    'tags',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      job[field] = req.body[field];
    }
  });

  await job.save();

  res.status(200).json({
    status: 'success',
    message: 'Job updated successfully',
    data: {
      job,
    },
  });
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  const job = await getJobOrFail(req.params.jobId);
  await checkCompanyOwnership(job.company_id, req.user._id);

  job.is_active = false;
  job.is_published = false;
  await job.save();

  res.status(200).json({
    status: 'success',
    message: 'Job deleted successfully',
  });
});
