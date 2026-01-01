const JobPost = require('../models/jobModel');
const JobApplication = require('../models/jobApplicationModel');
const catchAsync = require('../utilities/catchAsync');

exports.getEmployerDashboardStats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // 1️) Job stats
  const totalJobs = await JobPost.countDocuments({
    createdBy: userId,
  });

  const activeJobs = await JobPost.countDocuments({
    createdBy: userId,
    isActive: true,
  });

  const publishedJobs = await JobPost.countDocuments({
    createdBy: userId,
    isPublished: true,
  });

  // 2️) Application stats
  const applicationStats = await JobApplication.aggregate([
    {
      $lookup: {
        from: 'jobposts',
        localField: 'job',
        foreignField: '_id',
        as: 'job',
      },
    },
    { $unwind: '$job' },
    {
      $match: {
        'job.createdBy': userId,
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Normalize result
  const applicationSummary = {
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  };

  applicationStats.forEach((item) => {
    applicationSummary[item._id] = item.count;
    applicationSummary.total += item.count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      jobs: {
        total: totalJobs,
        active: activeJobs,
        published: publishedJobs,
      },
      applications: applicationSummary,
    },
  });
});
