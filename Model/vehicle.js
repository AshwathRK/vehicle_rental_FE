const mongoose = require('mongoose');

// category
const CategorySchema = new mongoose.Schema({
  category: {
    type: String,
    // enum: ['Sedan', 'Coupe', 'SUV', 'Convertible', 'Wagon', 'Crossover', 'Hatchback', 'Minivan'],
    required: true,
    unique:true
  },
  images: [
    {
      data: Buffer,
      contentType: String
    }
  ],

})
const vehicleSchema = new mongoose.Schema({
  // Basic Vehicle Details
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  licensePlate: { type: String, required: true, unique: true },

  // Media (Binary Images)
  images: [
    {
      data: Buffer,
      contentType: String
    }
  ],

  // Specifications
  transmission: { type: String, enum: ['Automatic', 'Manual'], required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  mileage: { type: String },
  seatingCapacity: { type: Number },
  numberOfDoors: { type: Number },
  airConditioning: { type: Boolean },
  luggageCapacity: { type: String, enum: ['Small', 'Medium', 'Large'] },

  // Rental Info
  pricePerDay: { type: Number, required: true },
  pricePerHour: { type: Number },
  deposit: { type: Number },
  discounts: {
    weekly: { type: Number },
    monthly: { type: Number }
  },
  fuelPolicy: { type: String, enum: ['Full-to-Full', 'Prepaid', 'Other'] },

  // Location Info
  location: {
    pickup: { type: String, required: true },
    dropoff: { type: String },
    city: { type: String }
  },

  // Insurance & Policies
  insurance: {
    type: { type: String, enum: ['Comprehensive', 'Third-party'] },
    provider: { type: String },
    expiryDate: { type: Date }
  },
  driverRequirements: {
    minAge: { type: Number },
    licenseType: { type: String }
  },
  termsAndConditions: { type: String },
  cancellationPolicy: { type: String },

  // Maintenance Info
  maintenance: {
    lastServiced: { type: Date },
    nextServiceDue: { type: Date },
    condition: {
      type: String,
      enum: ['Good', 'Needs Service', 'Damaged'],
      default: 'Good'
    },
    odometerReading: { type: Number }
  },

  // Ownership and Admin Approval
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
    required: true
  },
  isAdminApproved: {
    type: Boolean,
    default: false,
    required: true
  }

}, { timestamps: true });

const Category = mongoose.model("Category", CategorySchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = { Vehicle, Category };
