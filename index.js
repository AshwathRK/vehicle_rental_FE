const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const cookieParser = require('cookie-parser');
require('./db');
const router = require('./Router/router');
const { handlePaymentEmail } = require('./Controllers/paymentemail');

const HTTP_Server = express();

// ✅ Razorpay webhook route — raw body (must be before express.json())
HTTP_Server.post(
    '/razorpay/webhook',
    express.raw({ type: 'application/json' }), // keep as Buffer
    handlePaymentEmail
);

// ✅ Parse JSON and URL-encoded data (for all other routes)
HTTP_Server.use(express.json());
HTTP_Server.use(express.urlencoded({ extended: true }));

// ✅ Parse cookies
HTTP_Server.use(cookieParser());

// ✅ Enable CORS
const allowedOrigins = [
    'https://vehiclerentzone.netlify.app',
    'http://localhost:5174'
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
HTTP_Server.use(cors(corsOptions));

// ✅ Serve static files
HTTP_Server.use(express.static('public'));

// ✅ Connect API routes
HTTP_Server.use('/', router);

HTTP_Server.listen(3000, (error) => {
    if (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
    console.log('✅ Server is running on port 3000');
});
