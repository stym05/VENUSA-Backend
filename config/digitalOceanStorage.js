const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'blr1',  // Replace with your Space's region
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_KEY_ACCESS,
  },
  endpoint: 'https://venusa-bucket.blr1.digitaloceanspaces.com',  // Replace with your Space's endpoint
  forcePathStyle: true,  // Required for DigitalOcean Spaces
});

module.exports = s3;
