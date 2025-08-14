// Import the crypto module for generating the HMAC signature
const crypto = require("crypto");

// Import the nodemailer module for sending emails
const nodemailer = require("nodemailer");

// Import SendGrid's mail library
const sgMail = require("@sendgrid/mail");

// Import the getRawBody function from the raw-body module (not used in this code)
// const getRawBody = require('raw-body'); // commented out since not used

/**
 * Handle payment email webhook from Razorpay
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePaymentEmail = async (req, res) => {
    debugger
    try {
        // Convert the request body to a string
        const rawBody = req.body.toString();
        console.log("Raw Body:", rawBody) // Log the raw body for debugging purposes

        // Get the Razorpay webhook secret key from environment variables
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        console.log("Secret Key:", secret) // Log the secret key for debugging purposes (remove in production)

        // Create an HMAC object using the secret key and SHA-256 algorithm
        const shasum = crypto.createHmac("sha256", secret);

        // Update the HMAC object with the raw body string
        shasum.update(rawBody);

        // Generate the HMAC signature as a hexadecimal string
        const digest = shasum.digest("hex");

        // Log the generated digest and Razorpay signature for debugging purposes
        console.log("Generated Digest:", digest);
        console.log("Razorpay Signature:", req.headers["x-razorpay-signature"]);

        // Check if the generated digest matches the Razorpay signature
        if (digest !== req.headers["x-razorpay-signature"]) {
            console.log("❌ Invalid signature"); // Log an error message if the signatures don't match
            return res.status(400).send("Invalid signature"); // Return a 400 error response
        }

        // Parse the raw body string as JSON
        const data = JSON.parse(rawBody);

        // Get the event type from the parsed JSON data
        const event = data.event;

        // Check if the event type is "payment.captured"
        if (event === "payment.captured") {
            // Get the payment entity from the parsed JSON data
            const payment = data.payload.payment.entity;

            // Get the email address and amount from the payment entity
            const email = payment.email;
            const amount = payment.amount / 100; // Convert the amount to rupees

            const msg = {
                to: email, // Customer's email address
                from: process.env.SENDGRID_FROM_EMAIL, // Must be a verified sender in SendGrid
                templateId: process.env.SENDGRID_TEMPLATE_ID, // SendGrid template ID
                dynamic_template_data: {
                    address: "123 Main Street, Chennai, Tamil Nadu", // Replace with actual booking address
                    paymentDate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
                    orderid: payment.id, // Razorpay payment ID
                    amount: amount, // Payment amount in rupees
                    makeandmodel: "Toyota Fortuner", // Replace with actual vehicle name/model
                    registernumber: "TN 01 AB 1234", // Replace with actual registration number
                    picupdate: "2025-08-15 10:00 AM", // Replace with actual pickup date/time
                    returndate: "2025-08-17 05:00 PM", // Replace with actual return date/time
                    pickuplocation: "Renzzi Car Rentals, Chennai" // Replace with actual pickup location
                }
            };

            /**
             * 9️⃣ Send the email through SendGrid
             * If successful, log the confirmation in the server console
             */
            await sgMail.send(msg);

            // Log a success message with the email address and payment ID
            console.log(`✅ Email sent to ${email} for payment ${payment.id}`);
        }

        // Return a success response
        res.json({ status: "ok" });
    } catch (err) {
        // Log an error message with the error object
        console.error("❌ Error in webhook:", err);

        // Return a 500 error response
        res.status(500).send("Webhook error");
    }
};

// Export the handlePaymentEmail function
module.exports = { handlePaymentEmail };