const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A Tour Name must have less or equal then 40 characters.',
      ],
      minlength: [
        10,
        'A Tour Name must have less or equal then 10 characters.',
      ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating  must be below 5.0'],
      // This will run each time there is new value in ratingsAverage
      set: (val) => Math.round(val * 10), //
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on New Document Creation
          return val < this.price; // 100 < 200
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // createdAt field only lives in DB
    },
    startDates: [Date],
    sectretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      //Expects Array of numbers
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //Implement Embedding using Mongoose
    guides: [
      // We expect the time each of this element in the guides array to be MONGO DB ID
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
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

// პოვნის დროს პერფორმანსისთვის
// მაგ 3 აითემის საპოვნელად 3დოკუმენტი რო შეამოწმოს და არა ყველა მაგალითად
// 1 - sorting ascending(ზრდადობით) order and -1 means descending(კლებადობით) order indexes
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// 2D sphere index it describes data in real points on earth
tourSchema.index({ startLocation: '2dsphere' });

// We can't use virtual property as query because it's not part of DB
// tour.find({durationWeek: {$gt: 1}}) not gonna work
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate -> every tour should not its reviews
//(besides this reviews aren't in same collection)
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//! (1) DOOCUMENT MIDDLEWARE: runs before .save() and .create() only!
// this refers to document
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// tourSchema.pre('save', async function (next) {
//   //Array of Promises
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));

//   // Run all Promises and save user documents in guides
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//    console.log('Will save document...')
//    next();
// });
// tourSchema.post('save', function (doc, next) {
//    console.log(doc);
//    next();
// });

//! (2) QUERY MIDDLEWARE: this refers to query
// this middleware will execute for all the string which starts with find
tourSchema.pre(/^find/, function (next) {
  this.find({
    sectretTour: {
      $ne: true,
    },
  });

  this.start = Date.now();
  next();
});

//Implement Embedding using Mongoose
// Fill up tours data with guides fron Users collection
//Guids field in tourModel only contains reference
//ანაცვლებს აიდიებს შესაბამისი კონტენტით
// const tour = await Tour.findById(req.params.id).populate('guides');
tourSchema.pre(/^find/, function (next) {
  //This points current query ()
  this.populate({
    path: 'guides',
    // Not Include
    select: '-__v -passwordChangedAt',
  });

  next();
});

// tourSchema.post(/^find/, function (doc, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   next();
// });

//! (3) AGGREGATION MIDDLEWARE: this refers to aggregation object
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: {
//       sectretTour: {
//         $ne: true,
//       },
//     },
//   });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
