const axios = require("axios");
require("dotenv").config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const createPaymentPage = async (req, res) => {
    debugger
  try {
    const { name, email, amount } = req.body;

    const response = await axios.post("https://api.razorpay.com/v1/payment_pages", {
      title: "Order Payment",
      description: "Pay for your order",
      amount: amount * 100, // in paise
      currency: "INR",
      customer: {
        name,
        email,
      },
      redirect_url: 'http://localhost:5173/',
      notes: {
        order_id: `order_${Date.now()}`,
      },
    }, {
      auth: {
        username: RAZORPAY_KEY_ID,
        password: RAZORPAY_KEY_SECRET,
      },
    });

    res.json({ url: response.data.short_url });
  } catch (error) {
    console.error("Error creating payment page:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create payment page" });
  }
};


module.exports = {
    createPaymentPage
}