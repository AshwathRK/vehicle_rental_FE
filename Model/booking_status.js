const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  AddressLine1: { type: String, required: true },
  email: { type: String, required: true },
  AddressLine2: { type: String },
  City: { type: String, required: true },
  state: { type: String, required: true },
  Zipcode: { type: String, required: true },
  Country: { type: String, required: true },
  mobile: { type: String, required: true }
}, { _id: false });

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
  },
  address: {
    type: addressSchema,
  },
  pickup: {
    type: String,
  }

}, { timestamps: true });

module.exports = mongoose.model('BookingStatus', bookingSchema);
