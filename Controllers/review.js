const Review = require('../Model/review');
const Vehicle = require('../Model/vehicle');

// Create a review
const createReview = async (req, res) => {
    const { carId, userId, rating, comment } = req.body;

    try {
        const review = new Review({ carId, userId, rating, comment });
        await review.save();
        res.status(201).json({ message: 'Review submitted', data: review });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get all reviews for a specific car
const getReviewsByCarId = async (req, res) => {
    try {
        const reviews = await Review.find({ carId: req.params.carId }).populate('userId', 'name');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get top-rated cars
const getTopRatedCars = async (req, res) => {
    try {
        const topCars = await Review.aggregate([
            {
                $group: {
                    _id: '$carId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            },
            {
                $sort: { averageRating: -1, reviewCount: -1 }
            },
            {
                $limit: 5 // top 5 cars
            },
            {
                $lookup: {
                    from: 'vehicles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vehicle'
                }
            },
            {
                $unwind: '$vehicle'
            }
        ]);

        res.status(200).json(topCars);
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

module.exports = {
    createReview,
    getReviewsByCarId,
    getTopRatedCars
}
