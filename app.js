const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const AppError = require('./utilities/globalAppError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const companyRouter = require('./routes/companyRoutes');
const jobRouter = require('./routes/jobRoutes');
const jobAppllicationRouter = require('./routes/jobApplicationRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const jobCategoryRouter = require('./routes/jobCategoryRoutes');
const tagRouter = require('./routes/tagRoutes');
const adminRouter = require('./routes/adminRoutes');
const emailTestRouter = require('./routes/emailTestRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const subscriptionRouter = require('./routes/subscriptionRoutes');
const followRouter = require('./routes/followRoutes');
const freelancerProfileRouter = require('./routes/freelancerProfileRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sheqlee API is running 🚀',
  });
});

// ROUTES
// app.use(router);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/applications', jobAppllicationRouter);
app.use('/api/v1/dashboards', dashboardRouter);
app.use('/api/v1/categories', jobCategoryRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/emails', emailTestRouter);
app.use('/api/v1/admins', adminRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/follows', followRouter);
app.use('/api/v1/freelancer-profile', freelancerProfileRouter);
app.use('/api/v1/feedbacks', feedbackRouter);

// 404 handler (optional)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
