const multer = require('multer');

const storage = multer.memoryStorage(); // stores image as Buffer
const upload = multer({ storage });

module.exports = upload;
