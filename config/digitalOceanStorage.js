const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: new AWS.Endpoint('https://venusa-bucket.blr1.digitaloceanspaces.com'), // Replace with your Space's endpoint
  accessKeyId: 'DO00Y64PNVKGMLT7EWPX',
  secretAccessKey: 'HHuhaQMtjKu+TQU/alubtm0s+jOWo3MFHOACP1kx3f8',
  region: 'blr1', // Replace with your Space's region
});

module.exports = s3;