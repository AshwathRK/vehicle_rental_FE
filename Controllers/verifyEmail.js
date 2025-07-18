const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Otp = require("../Model/verifyEmail");
const User = require('../Model/user');
require("dotenv").config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// 1. Send OTP to user's email
const sendResetOtp = async (req, res) => {
    try {
        const emailKey = req.body;
        const email = Object.keys(emailKey)[0]
        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: "User not found" });

        // Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins from now

        // Remove previous OTPs for this email
        await Otp.deleteMany({ email });

        // Save new OTP
        const newOtp = new Otp({ email, otp: otpCode, expiresAt });
        await newOtp.save();

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Password Reset OTP",
            text: `Your OTP for to verify the email address is: ${otpCode}`,
        });

        res.status(200).json({ msg: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};


// 2. Verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = await Otp.findOne({ email });

        if (!record) return res.status(400).json({ msg: "OTP not found" });

        if (record.expiresAt < Date.now()) {
            await Otp.deleteMany({ email }); // Clean expired
            return res.status(400).json({ msg: "OTP expired" });
        }

        if (record.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ msg: "User not found" });

        user.isEmailVerified = true;
        await user.save();

        // Optionally delete OTP after successful verification
        await Otp.deleteMany({ email });

        res.status(200).json({ msg: "OTP verified" });

    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};



// 3. Reset Password

const resetPassword = async (req, res) => {
    // debugger
    try {
        const { email, passwordData } = req.body;

        const { oldPassword, newPassword } = passwordData
        console.log(req.body)

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: false,
                message: "Old password is wrong!"
            })
        }

        user.password = hashedPassword;
        await user.save();

        // Clear OTP after successful reset
        await Otp.deleteMany({ email });

        res.status(200).json({ msg: "Password reset successfully, Please login" });
    } catch (err) {
        res.status(500).json({ msg: "Server error", error: err.message });
    }
};

module.exports = {
    sendResetOtp, verifyOtp, resetPassword
};