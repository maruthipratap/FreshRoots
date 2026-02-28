const express = require('express')
const router = express.Router()
const {
  placeOrder,
  getFarmerOrders,
  getBuyerOrders,
  updateOrderStatus,
  updatePaymentStatus
} = require('../controllers/orderController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, placeOrder)
router.get('/farmer/:farmerId', protect, getFarmerOrders)
router.get('/buyer/:buyerId', protect, getBuyerOrders)
router.patch('/:id/status', protect, updateOrderStatus)
router.patch('/:id/payment', protect, updatePaymentStatus)

module.exports = router