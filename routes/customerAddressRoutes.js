const express = require('express');
const router = express.Router();
const addressController = require('../controllers/customerAddressController');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Routes for Address Management
router.post('/', addressController.createAddress);
router.get('/', addressController.getAddress )
router.get('/customer/:customerId', addressController.getAddressesByCustomer);
router.get('/:addressId', addressController.getAddressById);
router.put('/:addressId', addressController.updateAddress);
router.delete('/:addressId', addressController.deleteAddress);
router.post('/set-default', addressController.setDefaultAddress);

module.exports = router;
