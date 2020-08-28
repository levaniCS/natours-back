const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

// Each user should post one review on single tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

// Static method of Schema
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // points curr model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //Points curr modal document
  this.constructor.calcAverageRatings(this.tour);
});

// findOneAndDelete || findOneAndUpdate
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // cur query
  this.r = await this.findOne();
  next();
});
//! Pass Data from pre middleware to post
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
