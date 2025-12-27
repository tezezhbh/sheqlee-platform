const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');
const AppError = require('./utilities/globalAppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// ROUTES
// app.use(router);
app.use('/api/v1/users', userRouter);

// 404 handler (optional)
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
