const express = require('express')
const router = express.Router()
const { protect, farmerOnly, buyerOnly } = require('../middleware/authMiddleware')
const {
  createBox,
  getBoxes,
  getFarmerBoxes,
  subscribeToBox,
  getMySubscriptions,
  getFarmerSubscriptions,
  cancelSubscription,
  deleteBox
} = require('../controllers/subscriptionController')

// Box routes
router.post('/boxes', protect, farmerOnly, createBox)
router.get('/boxes', protect, getBoxes)
router.get('/boxes/farmer', protect, farmerOnly, getFarmerBoxes)
router.delete('/boxes/:id', protect, farmerOnly, deleteBox)

// Subscription routes
router.post('/subscribe/:boxId', protect, buyerOnly, subscribeToBox)
router.get('/my', protect, buyerOnly, getMySubscriptions)
router.get('/farmer', protect, farmerOnly, getFarmerSubscriptions)
router.patch('/:id/cancel', protect, buyerOnly, cancelSubscription)

module.exports = router