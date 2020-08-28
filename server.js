/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//for defining enviroment variables
dotenv.config({
  path: './config.env',
});

process.on('uncaughtException', (err) => {
  console.log('UNCODE REJECTION ! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1); // 1 - uncode exception
});

// this should be required after defining variables
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled REJECTION ! Shutting down...');
  server.close(() => {
    process.exit(1); // 1 - uncode exception
  });
});

// For not to shut down out application on heroku every 24hours
process.on('SIGTERM', () => {
  console.log('SIGTERM RECIEVED. Shutting down gracefully 🙂');
  server.close(() => {
    console.log('🔥 Process terminated!');
  });
});
