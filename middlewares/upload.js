const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Files will be stored in 'uploads/' directory
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer with storage settings
const upload = multer({ storage: storage });

// Define an upload route
// app.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }
//   res.send(`File uploaded: ${req.file.filename}`);
// });


// app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
//     res.send(`${req.files.length} files uploaded`);
//   });