const mongoose = require('mongoose');
const BookingStatus = require('../Model/booking_status')
const {Vehicle} = require('../Model/vehicle')

// Get by carId
const handleGetBookingStatusByCarId = async (req, res) => {
    const { carId } = req.params;

    try {
        const response = await BookingStatus.find({ carId: mongoose.Types.ObjectId(carId) });

        if (response.length === 0) {
            return res.status(404).json({ message: 'No bookings found!' });
        }

        return res.status(200).json({ message: 'Bookings fetched successfully', data: response });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get by userId
const handleGetBookingStatusByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const response = await BookingStatus.find({ userId: mongoose.Types.ObjectId(userId) });

        if (response.length === 0) {
            return res.status(404).json({ message: 'No bookings found!' });
        }

        return res.status(200).json({ message: 'Bookings fetched successfully', data: response });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// Get by bookingId
const handleGetBookingsStatusByBookingId = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const response = await BookingStatus.findById(bookingId);

        if (!response) {
            return res.status(404).json({ message: 'Booking not found!' });
        }

        return res.status(200).json({ message: 'Booking fetched successfully', data: response });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

// ✅ Create booking
const handleCreateBookingStatus = async (req, res) => {
  try {
    const { carId, userId, startDateTime, endDateTime, status } = req.body;

    const booking = new BookingStatus({
      carId,
      userId,
      startDateTime,
      endDateTime,
      status
    });

    const savedBooking = await booking.save();

    if (status === "Confirmed") {
      await Vehicle.findByIdAndUpdate(carId, { $inc: { bookingCount: 1 } }, { new: true });
    }

    return res.status(201).json({ message: 'Booking created successfully!', data: savedBooking });
  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};


// ✅ Update booking
const handleUpdateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const updateData = req.body;

  try {
    // Step 1: Get the existing booking
    const existingBooking = await BookingStatus.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found!' });
    }

    // Step 2: Perform update
    const updated = await BookingStatus.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    // Step 3: Check if status changed to "Cancelled" from "Confirmed"
    if (
      updateData.status === 'Cancelled' &&
      existingBooking.status === 'Confirmed'
    ) {
      await Vehicle.findByIdAndUpdate(
        existingBooking.carId,
        { $inc: { bookingCount: -1 } },
        { new: true }
      );
    }

    return res.status(200).json({
      message: 'Booking updated successfully!',
      data: updated
    });

  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};


// ✅ Delete booking
const handleDeleteBookingStatus = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const deleted = await BookingStatus.findByIdAndDelete(bookingId);

        if (!deleted) {
            return res.status(404).json({ message: 'Booking not found!' });
        }

        return res.status(200).json({ message: 'Booking deleted successfully!', data: deleted });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};

module.exports = {
    handleGetBookingStatusByCarId,
    handleGetBookingStatusByUserId,
    handleGetBookingsStatusByBookingId,
    handleCreateBookingStatus,
    handleUpdateBookingStatus,
    handleDeleteBookingStatus
}