const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3 = require('../config/digitalOceanStorage');

// Define storage dynamically based on file type
const storage = multerS3({
  s3: s3,
  bucket: 'venusa-bucket', // Replace with your bucket name
  acl: 'public-read',
  key: function (req, file, cb) {
    let uploadPath = 'other/'; // Default folder

    // Define folder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath = 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath = 'videos/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = 'documents/';
    }

    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, uploadPath + path.parse(file.originalname).name + '-' + uniqueSuffix);
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

// Initialize multer with DigitalOcean Spaces storage
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Max 50MB
});

module.exports = upload;
