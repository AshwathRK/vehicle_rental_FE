const crypto =  require("crypto");
const nodemailer = require("nodemailer");

const handlePaymentEmail =  async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
        const event = req.body.event;

        if (event === "payment.captured") {
            const payment = req.body.payload.payment.entity;

            // You can get payment details here
            const email = payment.email; // if collected during checkout
            const amount = payment.amount / 100;

            // Send email
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            await transporter.sendMail({
                from: `"Vehicle Rent Zone" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Payment Confirmation",
                html: `
                    <h3>Payment Successful</h3>
                    <p>Thank you for your payment of ₹${amount}.</p>
                    <p>Payment ID: <b>${payment.id}</b></p>
                `
            });
        }

        res.json({ status: "ok" });
    } else {
        res.status(400).send("Invalid signature");
    }
};

module.exports =  {handlePaymentEmail};
