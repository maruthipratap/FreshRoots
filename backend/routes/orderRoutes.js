const express = require('express')
const router = express.Router()
const { protect, farmerOnly, buyerOnly } = require('../middleware/authMiddleware')
const {
  placeOrder,
  getFarmerOrders,
  getBuyerOrders,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController')

// Place an order (buyer only)
router.post('/', protect, buyerOnly, placeOrder)

// Get all orders for a buyer
router.get('/buyer/:buyerId', protect, getBuyerOrders)

// Get all orders for a farmer
router.get('/farmer/:farmerId', protect, getFarmerOrders)

// Farmer updates order status (accepted/completed/cancelled)
router.patch('/:id/status', protect, farmerOnly, updateOrderStatus)

// Buyer makes mock payment
router.patch('/:id/payment', protect, buyerOnly, updatePaymentStatus)

module.exports = router