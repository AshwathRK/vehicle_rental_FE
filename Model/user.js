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
    phone: {
        type: Number,
    },
    secondary: {
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
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    postal: {
        type: String
    },
    country: {
        type: String
    },

    // bank details 

    accountnumber: {
        type: Number
    },
    ifsc: {
        type: String
    },
    accountholder: {
        type: String
    },
    bankname: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    profileType:{
        type: String,
        enum: ['Admin', 'Affiliate', 'User'],
        default:'User'
    }

}, { timestamps: true });
// Create the User model from the schema
const User = mongoose.model('UserDetails', userSchema);
module.exports = User;