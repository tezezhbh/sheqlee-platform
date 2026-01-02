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

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// ROUTES
// app.use(router);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/applications', jobAppllicationRouter);
app.use('/api/v1/dashboards', dashboardRouter);
app.use('/api/v1/categories', jobCategoryRouter);

// 404 handler (optional)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
