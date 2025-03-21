const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage dynamically based on file type
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/other/'; // Default folder

    // Define folder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = 'uploads/videos/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = 'uploads/documents/';
    }

    // Ensure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, path.parse(file.originalname).name + '-' + uniqueSuffix);
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/', 'video/', 'application/pdf'];

  if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos, and PDFs are allowed!'), false);
  }
};

// Initialize multer
const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // Max 50MB

module.exports = upload;
