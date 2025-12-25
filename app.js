const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// ROUTES
// app.use(router);
app.use('/api/v1/users', userRouter);

console.log('Hello this may be from the server!');

module.exports = app;
