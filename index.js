const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const cookieParser = require('cookie-parser');

require('./db');
const router = require('./Router/router');

const HTTP_Server = express();

const ALLOWED_URL = process.env.ALLOWED_URL;

// ✅ Parse JSON and URL-encoded data
HTTP_Server.use(express.json());
HTTP_Server.use(express.urlencoded({ extended: true }));

// ✅ Parse cookies
HTTP_Server.use(cookieParser());

// ✅ Enable CORS for both localhost and Netlify
const allowedOrigins = [
    'https://vehiclerentzone.netlify.app', 'http://localhost:5173'
];

const corsOptions = {
    origin: function (origin, callback) {
        // console.log('Origin:', origin); // Log the origin
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
};

HTTP_Server.use(cors(corsOptions));

// ✅ Serve static files if needed
HTTP_Server.use(express.static('public'));

// ✅ Connect your API routes
HTTP_Server.use('/', router);

HTTP_Server.listen(3000, (error) => {
    if (error) {
        console.error(`Error starting server: ${error.message}`);
        process.exit(1);
    }
    console.log('✅ Server is running on port 3000');
});