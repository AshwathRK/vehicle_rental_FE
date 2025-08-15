// Import the crypto module for generating the HMAC signature
const crypto = require("crypto");

// Import the nodemailer module for sending emails
const nodemailer = require("nodemailer");

// Import the getRawBody function from the raw-body module (not used in this code)
// const getRawBody = require('raw-body'); // commented out since not used

/**
 * Handle payment email webhook from Razorpay
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handlePaymentEmail = async (req, res) => {
    try {
        // Convert the request body to a string
        const rawBody = req.body.toString();

        // Get the Razorpay webhook secret key from environment variables
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Create an HMAC object using the secret key and SHA-256 algorithm
        const shasum = crypto.createHmac("sha256", secret);

        // Update the HMAC object with the raw body string
        shasum.update(rawBody);

        // Generate the HMAC signature as a hexadecimal string
        const digest = shasum.digest("hex");

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

            // Create a nodemailer transport object using Gmail
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER, // Get the email user from environment variables
                    pass: process.env.EMAIL_PASS, // Get the email password from environment variables
                },
            });

            // Send an email to the customer with payment confirmation details
            await transporter.sendMail({
                from: `"Vehicle Rent Zone" <${process.env.EMAIL_USER}>`, // Set the sender email address
                to: email, // Set the recipient email address
                subject: "Payment Confirmation", // Set the email subject
                html: `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .container {
                        width: 80%;
                        margin: 40px auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        background-color: #3399cc;
                        color: #fff;
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                    }
                    .content {
                        padding: 20px;
                    }
                    .footer {
                        padding: 10px;
                        border-top: 1px solid #ddd;
                        font-size: 12px;
                        color: #666;
                    }
                    .payment-id {
                        font-weight: bold;
                        font-size: 16px;
                    }
                        .message{
                        background-color: #f9f9f9;
                        padding: 10px;
                        border: 1px solid #ddd;}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Payment Confirmation</h2>
                    </div>
                    <div class="content">
                        <p>Dear Customer,</p>
                        <div class="message">
                            <p>We have received your payment successfully.</p>
                        </div>
                        <p>Thank you for your payment of ₹${amount}.</p>
                        <p>Payment ID: <span class="payment-id">${payment.id}</span></p>
                        <p>We appreciate your business!</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,</p>
                        <p>Renzzi vehicle Rental</p>
                    </div>
                </div>
            </body>
        </html>
    `, // Set the email body as HTML
            });

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