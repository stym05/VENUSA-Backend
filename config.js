const mongoose = require('mongoose');

// MongoDB connection URL
const url = 'mongodb://localhost:27017/venusa';


const connectToDB = async () => {
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connected to MongoDB using Mongoose');
        })
        .catch(err => {
            console.error('Error connecting to MongoDB', err);
        });

}


module.exports = connectToDB;