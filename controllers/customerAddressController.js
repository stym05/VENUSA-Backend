const Customers = require("../models/customers");

const { Address } = Customers;

// ✅ Create a new address
const createAddress = async (req, res) => {
    try {
        const { customer, street_address, city, state, postal_code, country, mobile_number, alternate_mobile_number, is_default } = req.body;

        if (is_default) {
            await Address.updateMany({ customer }, { is_default: false }); // Reset default address
        }

        const address = new Address({
            customer,
            street_address,
            city,
            state,
            postal_code,
            country,
            mobile_number,
            alternate_mobile_number,
            is_default
        });

        await address.save();
        res.status(201).json({ success: true, message: "Address added successfully", address });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add address", error: error.message });
    }
};

// ✅ Get all addresses for a customer
const getAddressesByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const addresses = await Address.find({ customer: customerId }).sort({ created_at: -1 });
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch addresses", error: error.message });
    }
};

// ✅ Get a single address by ID
const getAddressById = async (req, res) => {
    try {
        const { addressId } = req.params;
        const address = await Address.findById(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        res.status(200).json({ success: true, address });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch address", error: error.message });
    }
};

// ✅ Update an address
const updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const updates = req.body;

        if (updates.is_default) {
            await Address.updateMany({ customer: updates.customer }, { is_default: false });
        }

        const updatedAddress = await Address.findByIdAndUpdate(addressId, updates, { new: true });

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({ success: true, message: "Address updated successfully", updatedAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update address", error: error.message });
    }
};

// ✅ Delete an address
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const deletedAddress = await Address.findByIdAndDelete(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }
        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete address", error: error.message });
    }
};

// ✅ Set a default address
const setDefaultAddress = async (req, res) => {
    try {
        const { addressId, customerId } = req.body;

        await Address.updateMany({ customer: customerId }, { is_default: false });
        const updatedAddress = await Address.findByIdAndUpdate(addressId, { is_default: true }, { new: true });

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({ success: true, message: "Default address set successfully", updatedAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to set default address", error: error.message });
    }
};


module.exports = { createAddress, getAddressesByCustomer, getAddressById, updateAddress, deleteAddress, setDefaultAddress }