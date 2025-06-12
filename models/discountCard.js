const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DiscountCardSchema = new Schema({
    discountCode: { type: String, required: true, unique: true }, // Unique card number
    discountDescription: { type: String, required: true }, // Description of the discount
    discountPercentage: { type: Number, required: true, min: 0, max: 100 }, // Discount percentage
    expiryDate: { type: Date, required: true }, // Expiry date of the card
    isActive: { type: Boolean, default: true }, // Card status
    userLimit: { type: Number, default: 1 }, // Limit of how many times a user can use this card
}, { timestamps: true });

const DiscountCard = mongoose.model('DiscountCard', DiscountCardSchema);
module.exports = DiscountCard;
