const JobPost = require('../models/jobModel');
const JobApplication = require('../models/jobApplicationModel');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const Follow = require('./../models/followModel');
const Notification = require('../models/notificationModel'); // or JobAlert model
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/globalAppError');

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

//Utility: build date range
const getDateRange = ({ year, month }) => {
  if (!year) return {};

  if (month) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { $gte: start, $lt: end };
  }

  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  return { $gte: start, $lt: end };
};

// Utility: current year/month ranges
const getCurrentRanges = () => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  return {
    now,
    yearStart,
    monthStart,
    lastYearStart,
    lastMonthStart,
  };
};

// JOB POSTS STATS
exports.getJobStats = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  const { yearStart, monthStart, now } = getCurrentRanges();

  const total = await JobPost.countDocuments();

  const byYear = year
    ? await JobPost.countDocuments({
        createdAt: getDateRange({ year: Number(year) }),
      })
    : 0;

  const byMonth =
    year && month
      ? await JobPost.countDocuments({
          createdAt: getDateRange({
            year: Number(year),
            month: Number(month),
          }),
        })
      : 0;

  const thisYear = await JobPost.countDocuments({
    createdAt: {
      $gte: yearStart,
      $lte: now,
    },
  });

  const thisMonth = await JobPost.countDocuments({
    createdAt: {
      $gte: monthStart,
      $lte: now,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byYear,
      byMonth,
      thisYear,
      thisMonth,
    },
  });
});

//  COMPANIES STATS
exports.getCompanyStats = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  const { yearStart, monthStart, now } = getCurrentRanges();

  const total = await Company.countDocuments();

  const byYear = year
    ? await Company.countDocuments({
        createdAt: getDateRange({ year: Number(year) }),
      })
    : 0;

  const byMonth =
    year && month
      ? await Company.countDocuments({
          createdAt: getDateRange({
            year: Number(year),
            month: Number(month),
          }),
        })
      : 0;

  const thisYear = await Company.countDocuments({
    createdAt: {
      $gte: yearStart,
      $lte: now,
    },
  });

  const thisMonth = await Company.countDocuments({
    createdAt: {
      $gte: monthStart,
      $lte: now,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byYear,
      byMonth,
      thisYear,
      thisMonth,
    },
  });
});

// FREELANCERS STATS
exports.getFreelancerStats = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  const { yearStart, monthStart, now } = getCurrentRanges();

  const filter = { accountType: 'professional' };

  const total = await User.countDocuments(filter);

  const byYear = year
    ? await User.countDocuments({
        ...filter,
        createdAt: getDateRange({ year: Number(year) }),
      })
    : 0;

  const byMonth =
    year && month
      ? await User.countDocuments({
          ...filter,
          createdAt: getDateRange({
            year: Number(year),
            month: Number(month),
          }),
        })
      : 0;

  const thisYear = await User.countDocuments({
    ...filter,
    createdAt: {
      $gte: yearStart,
      $lte: now,
    },
  });

  const thisMonth = await User.countDocuments({
    ...filter,
    createdAt: {
      $gte: monthStart,
      $lte: now,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byYear,
      byMonth,
      thisYear,
      thisMonth,
    },
  });
});

// JOB ALERTS STATS
exports.getJobAlertStats = catchAsync(async (req, res, next) => {
  const { year, month } = req.query;
  const { yearStart, monthStart, now } = getCurrentRanges();

  const total = await Notification.countDocuments();

  const byYear = year
    ? await Notification.countDocuments({
        createdAt: getDateRange({ year: Number(year) }),
      })
    : 0;

  const byMonth =
    year && month
      ? await Notification.countDocuments({
          createdAt: getDateRange({
            year: Number(year),
            month: Number(month),
          }),
        })
      : 0;

  const thisYear = await Notification.countDocuments({
    createdAt: {
      $gte: yearStart,
      $lte: now,
    },
  });

  const thisMonth = await Notification.countDocuments({
    createdAt: {
      $gte: monthStart,
      $lte: now,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byYear,
      byMonth,
      thisYear,
      thisMonth,
    },
  });
});

// FOLLOW STATS
exports.getFollowStats = catchAsync(async (req, res, next) => {
  const { targetType } = req.params; // Company | JobCategory | Tag
  const { year, month } = req.query;

  const allowedTargets = ['Company', 'JobCategory', 'Tag'];
  if (!allowedTargets.includes(targetType)) {
    return next(new AppError('That is not cute! Invalid targeted Page', 400));
  }

  const { now, yearStart, monthStart, lastYearStart, lastMonthStart } =
    getCurrentRanges();

  const baseFilter = { targetType };
  console.log(baseFilter);

  const total = await Follow.countDocuments(baseFilter);

  const byYear = year
    ? await Follow.countDocuments({
        ...baseFilter,
        createdAt: getDateRange({ year: Number(year) }),
      })
    : 0;

  const byMonth =
    year && month
      ? await Follow.countDocuments({
          ...baseFilter,
          createdAt: getDateRange({
            year: Number(year),
            month: Number(month),
          }),
        })
      : 0;

  const thisYear = await Follow.countDocuments({
    ...baseFilter,
    createdAt: { $gte: yearStart, $lte: now },
  });

  const thisMonth = await Follow.countDocuments({
    ...baseFilter,
    createdAt: { $gte: monthStart, $lte: now },
  });

  // Growth calculations
  const lastYear = await Follow.countDocuments({
    ...baseFilter,
    createdAt: { $gte: lastYearStart, $lt: yearStart },
  });

  const lastMonth = await Follow.countDocuments({
    ...baseFilter,
    createdAt: { $gte: lastMonthStart, $lt: monthStart },
  });

  const growthYear =
    lastYear === 0
      ? thisYear === 0
        ? 0
        : 100
      : Math.round(((thisYear - lastYear) / lastYear) * 100);

  const growthMonth =
    lastMonth === 0
      ? thisMonth === 0
        ? 0
        : 100
      : Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  res.status(200).json({
    status: 'success',
    data: {
      total,
      byYear,
      byMonth,
      thisYear,
      thisMonth,
      growthYear,
      growthMonth,
    },
  });
});
