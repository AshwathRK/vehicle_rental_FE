const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Pending'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('BookingStatus', bookingSchema);