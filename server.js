/* eslint-disable prettier/prettier */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//for defining enviroment variables
dotenv.config({
  path: './config.env',
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


const port = process.env.port || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});