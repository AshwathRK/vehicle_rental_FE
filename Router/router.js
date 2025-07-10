const express = require('express');
const verifyTokenfromCookies = require('../Middleware/auth')
const {
  handleGetLogin,
  handleGetSignUp,
  handlePostLogin,
  handlePostSignUp,
  getUserDetails,
  // handleUpdateUser,
  logoutUser
} = require('../Controllers/user');

const upload = require('../Middleware/upload.js');
const {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} = require('../Controllers/vehicle.js');

const {
  handleGetBookingStatusByCarId,
  handleGetBookingStatusByUserId,
  handleGetBookingsStatusByBookingId,
  handleCreateBookingStatus,
  handleUpdateBookingStatus,
  handleDeleteBookingStatus
} = require('../Controllers/booking_status.js');

const {
  createReview,
  getReviewsByCarId,
  getTopRatedCars
} = require('../Controllers/review.js');

const router = express.Router();

// Authentication routes
router.get('/', verifyTokenfromCookies, handleGetLogin);
router.post('/', handlePostLogin);
router.get('/signup', handleGetSignUp);
router.post('/signup', handlePostSignUp);
router.get('/user', verifyTokenfromCookies, getUserDetails);
// router.patch('/user', verifyTokenfromCookies, handleUpdateUser);
router.get('/logout', logoutUser);

// Image upload
router.get('/categories', getAllCategory);
router.post('/categorie', upload.array('images'), createCategory);
router.put('/categorie/:id', upload.array('images'), updateCategory);
router.delete('/categorie/:id', upload.array('images'), deleteCategory);
router.post('/vehicle', upload.array('images', 5), createVehicle);
router.get('/vehicle', getVehicles);
router.get('/vehicle/:id', getVehicleById);
router.put('/vehicle/:id', upload.array('images', 5), updateVehicle);
router.delete('/vehicle/:id', deleteVehicle);

// Get all bookings by carId
router.get('/booking/car/:carId', handleGetBookingStatusByCarId);

// Get all bookings by userId
router.get('/booking/user/:userId', handleGetBookingStatusByUserId);

// Get a single booking by bookingId
router.get('/booking/:bookingId', handleGetBookingsStatusByBookingId);

// Create a new booking
router.post('/booking/', handleCreateBookingStatus);

// Update booking by bookingId
router.put('/booking/:bookingId', handleUpdateBookingStatus);

// Delete booking by bookingId
router.delete('/booking/:bookingId', handleDeleteBookingStatus);

// Review
router.post('/review', createReview);
router.get('/review/car/:carId', getReviewsByCarId);
router.get('/top-rated', getTopRatedCars);

// 404 handler
router.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Page not found (404)"
  });
});

module.exports = router;