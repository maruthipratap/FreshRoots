const express = require('express')
const router = express.Router()
const { protect, farmerOnly } = require('../middleware/authMiddleware')
const {
  sendOTP, register, login, getMe, updateProfile,
  requestVerification, verifyFarmer, updateFarmStory
} = require('../controllers/authController')

// Public routes
router.post('/send-otp', sendOTP)
router.post('/register', register)
router.post('/login', login)

// Protected routes
router.get('/me', protect, getMe)
router.patch('/profile', protect, updateProfile)

// Verification routes
router.patch('/request-verification', protect, farmerOnly, requestVerification)
router.patch('/admin/verify/:userId', protect, verifyFarmer)

// farm story
router.patch('/farm-story', protect, farmerOnly, updateFarmStory)
router.get('/farm-story/:farmerId', getFarmStory)
module.exports = router