const JobPost = require('../models/jobModel');
const JobApplication = require('../models/jobApplicationModel');
const AppError = require('../utilities/globalAppError');
const catchAsync = require('../utilities/catchAsync');

exports.applyToJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  // 1) Get job
  const job = await JobPost.findById(jobId);
  if (!job || !job.isActive || !job.isPublished) {
    return next(new AppError('Job is not available for application', 404));
  }

  // 2) Prevent duplicate application
  const alreadyApplied = await JobApplication.findOne({
    job: jobId,
    applicant: req.user._id,
  });

  if (alreadyApplied) {
    return next(new AppError('You already applied to this job', 400));
  }

  // 3) Prevent company owner from applying
  if (job.createdBy.toString() === req.user._id.toString()) {
    return next(new AppError('You cannot apply to your own job', 403));
  }

  // 4) Create application
  const application = await JobApplication.create({
    job: job._id,
    company: job.company,
    applicant: req.user._id,
    coverLetter: req.body.coverLetter,
  });

  res.status(201).json({
    status: 'success',
    message: 'Application submitted successfully',
    data: {
      application,
    },
  });
});

exports.getJobApplications = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;

  // 1️) Get job
  const job = await JobPost.findById(jobId);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }

  // 2️) Check ownership
  if (job.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not allowed to view applications for this job', 403)
    );
  }

  // 3️) Get applications
  const applications = await JobApplication.find({ job: jobId })
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications,
    },
  });
});

exports.getMyApplications = catchAsync(async (req, res, next) => {
  const applications = await JobApplication.find({
    applicant: req.user._id,
  })
    .populate('job', 'title location employment_type')
    .populate('company', 'name domain')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: applications.length,
    data: {
      applications,
    },
  });
});

exports.updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  // 1️) Validate status
  const statusEnum = JobApplication.schema.path('status').enumValues;

  if (!statusEnum.includes(status)) {
    return next(new AppError('Invalid application status', 400));
  }

  // 2️) Get application
  const application = await JobApplication.findById(applicationId);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  // 3️) Get related job
  const getJob = await JobPost.findById(application.job);
  if (!getJob) {
    return next(new AppError('Job not found', 404));
  }

  // 4️) Check ownership
  if (getJob.createdBy.toString() !== req.user._id.toString()) {
    return next(
      new AppError('You are not allowed to update this application', 403)
    );
  }

  // 5️) Update status
  application.status = status;
  await application.save();

  res.status(200).json({
    status: 'success',
    message: 'Application status updated successfully',
    data: {
      application,
    },
  });
});
