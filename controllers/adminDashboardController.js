const Cart = require("../models/cart");
const { Category, SubCategory } = require("../models/categories");
const { Customer } = require("../models/customers");
const Product = require("../models/products");
const Review = require("../models/review");
const { Users } = require("../models/Users");
const Wishlist = require("../models/wishlist");
const mongoose = require("mongoose");

const Models = {
    users: "Users",
    customer: "Customer",
    categorie: "Category",
    subcategorie: "SubCategory",
    cart: "Cart",
    product: "Product",
    review: "Review",
    wishlist: "Wishlist"
};


const getAllTables = async (req, res) => {
    try {
        const user = await Users.find();
        const customer = await Customer.find();
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const cartRoutes = await Cart.find();
        const products = await Product.find();
        const reviews = await Review.find();
        const wishlist = await Wishlist.find();
        const data = [
            { name: "users", count: user.length },
            { name: "customer", count: customer.length },
            { name: "categorie", count: categories.length },
            { name: "subCategorie", count: subcategories.length },
            { name: "cart", count: cartRoutes.length },
            { name: "product", count: products.length },
            { name: "review", count: reviews.length },
            { name: "wishlist", count: wishlist.length }
        ];
        res.status(200).json({
            success: true,
            code: 100,
            response: data
        })
    } catch (err) {
        console.log("Error in getAllTables = ", err);
    }
}

const getTableDetails = async (req, res) => {
    try {
        const { tableName } = req.body;

        if (!tableName || !Models[tableName]) {
            return res.status(400).json({ success: false, message: "Invalid collection name" });
        }

        // Dynamically get the Mongoose model
        const Model = mongoose.model(Models[tableName]);

        // Fetch all data from the collection
        const collectionData = await Model.find();

        res.status(200).json({ success: true, code: 100, data: collectionData });
    } catch (err) {
        console.log("Error in getTableDetails = ", err);
    }
}

module.exports = { getAllTables, getTableDetails };