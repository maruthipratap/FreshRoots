const express = require('express')
const router = express.Router()
const { protect, farmerOnly, buyerOnly } = require('../middleware/authMiddleware')
const {
  createNegotiation,
  respondToNegotiation,
  buyerRespond,
  getBuyerNegotiations,
  getFarmerNegotiations
} = require('../controllers/negotiationController')

router.post('/', protect, buyerOnly, createNegotiation)
router.get('/buyer', protect, buyerOnly, getBuyerNegotiations)
router.get('/farmer', protect, farmerOnly, getFarmerNegotiations)
router.patch('/:id/respond', protect, farmerOnly, respondToNegotiation)
router.patch('/:id/buyer-respond', protect, buyerOnly, buyerRespond)

module.exports = router