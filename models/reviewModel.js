const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'The review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    // when data will outputed as JSON
    toJSON: {
      virtuals: true,
    },
    // when data will outputed as Object
    toObject: {
      virtuals: true,
    },
  }
);

//Implement Embedding using Mongoose
// Fill up tours data with guides fron Users collection
//Guids field in tourModel only contains reference
//ანაცვლებს აიდიებს შესაბამისი კონტენტით
// const tour = await Tour.findById(req.params.id).populate('guides');
reviewSchema.pre(/^find/, function (next) {
  //This points current query ()
  // this.populate({
  //   path: 'user',
  //   //Include Only
  //   select: 'name',
  // }).populate({
  //   path: 'tour',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
