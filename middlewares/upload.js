const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');


const storage = multerS3({
  s3: new S3Client({
    region: 'blr1',  // Replace with your Space's region
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_KEY_ACCESS,
    },
    endpoint: 'https://venusa-bucket.blr1.digitaloceanspaces.com',  // Replace with your Space's endpoint
    forcePathStyle: true,  // Required for DigitalOcean Spaces
  }),
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

// Export the upload middleware
module.exports = upload;
