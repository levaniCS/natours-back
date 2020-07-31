const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//! 1) Global MIDDLEWARES\\
//? It adds SECURE headers (SET SECURITY HTTP HEADERS)
app.use(helmet());

// Development logging nicely formatted messages in terminal
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//? Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 60min 60 sec 1000ms
  message: 'Too many requests from this IP, Please try again in an hour!',
});

//Every routes which starts witch api url will be limited
app.use('/api', limiter);

// middleware - function that can modify incoming data
// middle -- between the request and the response
// to put body object in request (req.body to be available)
//Body parser
//* when we have body larger than 10kb basically not be accepted
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (CROSS SIDE SCRIPTING Attacks)
app.use(xss());

// Prevent parameter pollution (ex. it clears up query string)
app.use(
  hpp({
    // List of properties which we allow to duplicate query string (req.query.[string])
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//* Serving static files
app.use(express.static(`${__dirname}/public`));

//* Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//! 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// If none of above Url matches
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//! ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
