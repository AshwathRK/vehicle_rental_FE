const express = require('express');
const router = express.Router();

// Middleware
const verifyTokenfromCookies = require('../Middleware/auth');
const upload = require('../Middleware/upload.js');

// ==================== AUTHENTICATION ROUTES ==================== //
const {
  handleGetLogin,
  handleGetSignUp,
  handlePostLogin,
  handlePostSignUp,
  getUserDetails,
  getUserDetailsById,
  handleUpdateUser,
  updateProfileImage,
  getAllAffiliateUsersWithCar,
  logoutUser
} = require('../Controllers/user');

// Login and Signup
router.get('/', verifyTokenfromCookies, handleGetLogin);      // Get login page (if user has token)
router.post('/', handlePostLogin);                             // Login user
router.get('/signup', handleGetSignUp);                        // Get signup page
router.post('/signup', handlePostSignUp);                      // Register new user
router.get('/user', verifyTokenfromCookies, getUserDetails);   // Get logged-in user details
router.put('/user/:userId', verifyTokenfromCookies, handleUpdateUser); // (Optional) Update user
router.put('/updateprofile/:userID', verifyTokenfromCookies, upload.single('profile'), updateProfileImage)
router.get('/getaffiliate', getAllAffiliateUsersWithCar)
router.get('/user/:id', getUserDetailsById)
router.get('/logout', logoutUser);                             // Logout and clear token


//===================== Verify Email ======================= //

const { sendResetOtp, verifyOtp, resetPassword } = require('../Controllers/verifyEmail.js')

router.post('/sendotp', sendResetOtp);
router.post('/verifyotp', verifyOtp);
router.put('/updatepassword/:userId', resetPassword);

// ==================== CATEGORY ROUTES ==================== //
const {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createVehicle,
  getAdminApprovedVehicles,
  getAdminNotApprovedVehicles,
  getVehicleById,
  getVehicleByFilter,
  getTopBookedVehicles,
  similierCars,
  getLowPriceVehicle,
  getVehiclesByUserId,
  updateVehicle,
  deleteVehicle
} = require('../Controllers/vehicle.js');

// Category CRUD
router.get('/categories', getAllCategory);                         // Get all categories
router.get('/categorie/:id', getCategoryById)                      // Get categories by ID
router.post('/categorie', upload.array('images'), createCategory); // Create category with image upload
router.put('/categorie/:id', upload.array('images'), updateCategory); // Update category by ID
router.delete('/categorie/:id', upload.array('images'), deleteCategory); // Delete category by ID

// ==================== VEHICLE ROUTES ==================== //
// Vehicle CRUD and Listing
router.post('/vehicle', verifyTokenfromCookies, upload.array('images', 5), createVehicle);  // Create vehicle with up to 5 images
router.get('/approvedvehicle', getAdminApprovedVehicles);           // Get admin approved vehicles
router.get('/notapprovedvehicle', getAdminNotApprovedVehicles);     // Get admin Not approved vehicles
router.get('/vehicle/:id', getVehicleById);                         // Get vehicle by ID
router.get('/topbooking', getTopBookedVehicles);                   // Get most booked vehicles / limit 6
router.get('/filtervehicles', getVehicleByFilter);
router.get('/affiliate/:userId', getVehiclesByUserId);
router.get('/similarcars/:categoryId', similierCars)
router.get('/startfrom', getLowPriceVehicle);                       // Get low price vehicle
router.put('/vehicle/:id', upload.array('images', 5), updateVehicle); // Update vehicle
router.delete('/vehicle/:id', deleteVehicle);                       // Delete vehicle

// ==================== BOOKING STATUS ROUTES ==================== //
const {
  handleGetBookingStatusByCarId,
  handleGetBookingStatusByUserId,
  handleGetBookingsStatusByBookingId,
  handleCreateBookingStatus,
  handleUpdateBookingStatus,
  handleDeleteBookingStatus
} = require('../Controllers/booking_status.js');

// Bookings
router.get('/booking/car/:carId', handleGetBookingStatusByCarId);       // Bookings by car
router.get('/booking/user/:userId', handleGetBookingStatusByUserId);    // Bookings by user
router.get('/booking/:bookingId', handleGetBookingsStatusByBookingId);  // Booking by booking ID
router.post('/booking', handleCreateBookingStatus);                     // Create booking
router.put('/booking/:bookingId', handleUpdateBookingStatus);           // Update booking
router.delete('/booking/:bookingId', handleDeleteBookingStatus);        // Delete booking

// ==================== REVIEW ROUTES ==================== //
const {
  createReview,
  getReviewsByCarId,
  getTopRatedCars
} = require('../Controllers/review.js');

// Reviews
router.post('/review', createReview);                // Post a review
router.get('/review/car/:carId', getReviewsByCarId);    // Get reviews for a specific car
router.get('/top-rated', getTopRatedCars);              // Get top-rated vehicles, limit 6


// ==================== PAYMENT ROUTES ==================== //
const paymentController = require('../Controllers/payment');

router.post('/order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/payment/:id', paymentController.getPaymentDetails);

// ==================== PAYMENT EMAIL ROUTE ==================== //
// const { handlePaymentEmail } = require('../Controllers/paymentemail');

// router.post(
//     "/razorpay/webhook",
//     express.raw({ type: "*/*" }), // ⬅️ This ensures req.body is a Buffer
//     handlePaymentEmail
// );

// ==================== 404 NOT FOUND HANDLER ==================== //
router.use((req, res, next) => {
  res.status(404).json({
    status: false,
    message: "Page not found (404)"
  });
});

module.exports = router;
