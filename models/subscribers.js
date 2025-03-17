const mongoose = require('mongoose');
const { Schema } = mongoose;


const SubscriberSchema = new Schema({
    email: { type: String, required: true, unique: true },
}, { timestamps: true });

const Subscribers = mongoose.model('Subscribers', SubscriberSchema);

module.exports = Subscribers;