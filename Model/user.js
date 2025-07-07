const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phonenumber:{
        type: Number,
    },
    password: {
        type: String,
        required: true,
    },
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
    }

}, { timestamps: true });
// Create the User model from the schema
const User = mongoose.model('UserDetails', userSchema);
module.exports = User;