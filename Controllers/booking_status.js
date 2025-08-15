const mongoose = require('mongoose');
const BookingStatus = require('../Model/booking_status')
const { Vehicle } = require('../Model/vehicle')

// Get by carId
const handleGetBookingStatusByCarId = async (req, res) => {
  // debugger
  const { carId } = req.params;

  try {
    const response = await BookingStatus.find({ carId: carId, status: { $eq: 'Confirmed' } });

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
  debugger
  const { userId } = req.params;

  try {
    const response = await BookingStatus.find({ userId });

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
  // debugger
  try {
    const { carId, userId, startDateTime, endDateTime, status, address, pickup } = req.body;

    // ✅ 1. Validate required booking fields
    if (!carId || !userId || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Missing required booking fields." });
    }

    // ✅ 2. Get vehicle info
    const vehicle = await Vehicle.findById(carId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    // ✅ 3. If vehicle is NOT for delivery → pickup required, address ignored
    if (!vehicle.delivery) {
      if (!pickup || pickup.trim() === "") {
        return res.status(400).json({ message: "Pickup location is required for non-delivery vehicles." });
      }
    } else if (vehicle.delivery) {
      const requiredAddressFields = [
        "name",
        "AddressLine1",
        "email",
        "City",
        "state",
        "Zipcode",
        "Country",
        "mobile"
      ];

      for (let field of requiredAddressFields) {
        if (!address?.[field] || address[field].toString().trim() === "") {
          return res.status(400).json({ message: `Address field "${field}" is required.` });
        }
      }
    }

    // ✅ 5. Create booking
    const booking = new BookingStatus({
      carId,
      userId,
      startDateTime,
      endDateTime,
      status,
      address: vehicle.delivery ? address : undefined,
      pickup: vehicle.delivery ? undefined : pickup
    });

    const savedBooking = await booking.save();

    // ✅ 6. If confirmed, increment booking count
    if (status === "Confirmed") {
      vehicle.bookingCount = (vehicle.bookingCount || 0) + 1;
      await vehicle.save();
    }

    return res.status(201).json({
      message: 'Booking created successfully!',
      data: savedBooking
    });

  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// ✅ Update booking
const handleUpdateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const updateData = req.body;

  try {
    // Validate updateData
    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({ message: 'Invalid update data' });
    }

    // Get the existing booking
    const existingBooking = await BookingStatus.findById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found!' });
    }

    // Perform update
    const updatedBooking = await BookingStatus.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    // Check if status changed to "Cancelled" from "Confirmed"
    if (
      updateData.status === 'Cancelled' &&
      existingBooking.status === 'Confirmed'
    ) {
      await Vehicle.findByIdAndUpdate(
        existingBooking.carId,
        { $inc: { bookingCount: -1 } }
      );
    }

    return res.status(200).json({
      message: 'Booking updated successfully!',
      data: updatedBooking
    });

  } catch (error) {
    console.error(error);
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