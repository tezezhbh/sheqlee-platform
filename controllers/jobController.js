const mongoose = require('mongoose');
const JobPost = require('../models/jobModel');
const Company = require('../models/companyModel');
const JobCategory = require('./../models/jobCategoryModel');
// const JobApplication = require('./../models/jobApplicationModel');
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

  if (!company.owner) {
    throw new AppError('There is no Company owner!', 500);
  }

  if (company.owner.toString() !== userId.toString()) {
    throw new AppError('You are not allowed to perform this action', 403);
  }

  return company;
};

exports.createJob = catchAsync(async (req, res, next) => {
  const {
    company,
    title,
    description,
    location,
    employmentType,
    experienceLevel,
    tags,
    category,
    requirements,
    salary,
    shortDescription,
  } = req.body;

  await checkCompanyOwnership(company, req.user._id);

  const existingJob = await JobPost.findOne({
    company,
    title,
    status: 'published',
    isActive: true,
  });

  // preventing duplicate Job Post
  if (existingJob) {
    return next(
      new AppError(
        'A job with this title already exists for this company',
        400,
      ),
    );
  }

  // Check if Category exists
  const categoryExists = await JobCategory.findOne({
    _id: category,
    isActive: true,
  });

  if (!categoryExists) {
    return next(new AppError('Invalid or inactive job category', 400));
  }

  // 3️) Create job
  const job = await JobPost.create({
    company,
    createdBy: req.user._id,
    title,
    description,
    location,
    employmentType,
    experienceLevel,
    tags,
    category,
    requirements,
    salary,
    shortDescription,
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
  const query = {
    status: 'published',
    // isActive: true,
  };

  // Keyword search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filter
  if (req.query.category) {
    const category = await JobCategory.findOne({
      slug: req.query.category,
      isActive: true,
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    query.category = category._id;
  }

  // Filter by Tags
  if (req.query.tags) {
    const rawTags = req.query.tags.split(',').map((t) => t.trim());

    const objectIds = rawTags.filter((id) =>
      mongoose.Types.ObjectId.isValid(id),
    );

    const slugs = rawTags
      .filter((t) => !mongoose.Types.ObjectId.isValid(t))
      .map((t) => t.toLowerCase());

    const tags = await Tag.find({
      isActive: true,
      $or: [{ _id: { $in: objectIds } }, { slug: { $in: slugs } }],
    });

    if (!tags.length) {
      return next(new AppError('No matching tags found', 404));
    }

    query.tags = { $in: tags.map((tag) => tag._id) };

    console.log('Incoming tags:', req.query.tags);
  }

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await JobPost.countDocuments(query);

  const jobs = await JobPost.find(query)
    .populate('company', 'name domain')
    .populate('tags', 'name slug')
    .populate('category', 'name slug')
    .populate('applicantsCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    total,
    data: {
      jobs,
    },
  });
});

exports.getOneJob = catchAsync(async (req, res, next) => {
  const job = await JobPost.findOne({
    _id: req.params.jobId,
    // isActive: true,
    status: 'published',
  })
    .populate('company', 'name domain')
    .populate('tags', 'name slug')
    .populate({
      path: 'applicants',
      select: 'createdAt', // Fields from JobApplication
      populate: {
        path: 'applicant',
        select: 'name email', // Fields from User model
        // This is the "Deep Populate" to get the Freelancer Title
        populate: {
          path: 'profile', // Assuming your User model has a virtual called 'profile'
          model: 'FreelancerProfile',
          select: 'title', // Only grab the title (e.g., "Full-Stack Developer")
        },
      },
    });

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
        company: new mongoose.Types.ObjectId(companyId),
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] },
        },
        active: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        drafts: {
          $sum: {
            $cond: [{ $eq: ['$status', 'draft'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    total: 0,
    published: 0,
    active: 0,
    drafts: 0,
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
    company: companyId,
    // status: 'published',
    // isActive: true,
  })
    .populate('company', 'name domain')
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
    company: companyId,
    // isActive: true,
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
  await checkCompanyOwnership(job.company, req.user._id);

  // 4) Publish
  job.status = 'published';
  job.isActive = true;
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
  await checkCompanyOwnership(job.company, req.user._id);

  job.status = 'draft';
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
  await checkCompanyOwnership(job.company, req.user._id);

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

// used in the company router
exports.companyOwnerToggleActive = catchAsync(async (req, res, next) => {
  const job = await getJobOrFail(req.params.id);

  // Ownership check
  await checkCompanyOwnership(job.company, req.user._id);

  // Prevent activating a draft that isn't published yet
  if (job.status === 'draft') {
    return next(
      new AppError(
        'Drafts cannot be toggled active. Please publish first.',
        400,
      ),
    );
  }

  job.isActive = !job.isActive;
  await job.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      active: job.isActive,
    },
  });
});

// DUPLICATE JOB
exports.duplicateJob = catchAsync(async (req, res, next) => {
  // Use .lean() for a plain JS object to make cloning easy
  const originalJob = await JobPost.findById(req.params.id).lean();
  if (!originalJob) return next(new AppError('Original job not found', 404));

  // Ownership Check
  await checkCompanyOwnership(originalJob.company, req.user._id);

  // Clean the object for duplication
  const { _id, id, createdAt, updatedAt, ...jobData } = originalJob;

  const duplicatedJob = await JobPost.create({
    ...jobData,
    title: `${jobData.title} (Copy)`,
    status: 'draft',
    isActive: false,
  });

  res.status(201).json({
    status: 'success',
    data: { job: duplicatedJob },
  });
});

// DELETE JOB (Permanent Database Removal)
exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await getJobOrFail(req.params.id);

  // Ownership Check
  await checkCompanyOwnership(job.company, req.user._id);

  // Permanent deletion from database
  await JobPost.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
