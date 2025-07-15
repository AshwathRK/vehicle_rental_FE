const Review = require('../Model/review');
const {Vehicle} = require('../Model/vehicle');

// Create a review and update averageRating on the vehicle
const createReview = async (req, res) => {
    const { carId, userId, rating, comment } = req.body;

    try {
        // Prevent duplicate reviews from same user
        const existingReview = await Review.findOne({ carId, userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already submitted a review for this car.' });
        }

        // Create and save new review
        const review = new Review({ carId, userId, rating, comment });
        await review.save();

        // Recalculate average rating and review count
        const ratingStats = await Review.aggregate([
            { $match: { carId: review.carId } },
            {
                $group: {
                    _id: '$carId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ]);

        const { averageRating, reviewCount } = ratingStats[0] || { averageRating: 0, reviewCount: 0 };

        // Update Vehicle model with new rating info
        await Vehicle.findByIdAndUpdate(
            carId,
            { averageRating, reviewCount },
            { new: true }
        );

        res.status(201).json({ message: 'Review submitted', data: review });

    } catch (error) {
        console.error('Error creating review:', error);
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
                $limit: 6 // top 6 cars
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
