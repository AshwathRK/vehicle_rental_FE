const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    // User Details
    fullname: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone:{
        type: Number,
    },
    secondary:{
        type: Number,
    },
    website: {
        type: String,
    },

    profile: [
    {
      data: Buffer,
      contentType: String
    }
  ],

    //Affiliate
    dateofbirth: {
        type: Date,
        default: "01/01/0001"
    },
    gender: {
        type: String,
    },
    streetaddress:{
        type : String
    },
    city:{
        type : String
    },
    State:{
        type : String
    },
    Postal:{
        type : String
    },
    Country:{
        type : String
    },
    isEmailVerified: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });
// Create the User model from the schema
const User = mongoose.model('UserDetails', userSchema);
module.exports = User;