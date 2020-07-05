const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures')


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
}


exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //To GET ONE tour by ID from DATABASE
    const tour = await Tour.findById(req.params.id);
    // 👆 same es 👉 Tour.findOne({ _id: req.params.id })
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    //To create tours in DATABASE
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    //To UPDATE tour by ID from DATABASE
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      //to return updated document
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    //To DELETE tour by ID from DATABASE
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};


exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([{
        $match: {
          ratingsAverage: {
            $gte: 4.5
          }
        }
      },
      {
        $group: {
          _id: {
            $toUpper: '$difficulty'
          },
          numTours: {
            $sum: 1
          },
          numRatings: {
            $sum: '$ratingsQuantity'
          },
          avgRating: {
            $avg: '$ratingsAverage'
          },
          avgPrice: {
            $avg: '$price'
          },
          minPrice: {
            $min: '$price'
          },
          maxPrice: {
            $max: '$price'
          }
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      },
      {
        $match: {
          _id: {
            $ne: 'EASY'
          }
        }
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}



exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([{
        // აბრუნებს თითოეული ერეის აითემისთვის თითთო დოკუმენტს
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$startDates'
          },
          numTourStarts: {
            $sum: 1
          },
          tours: {
            $push: '$name'
          }
        }
      },
      {
        // add field same es _id
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          // კლებადობით
          numTourStarts: -1
        }
      },
      // {
      //   // რამდენი გამოვიდეს
      //   $limit: 6
      // }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
}