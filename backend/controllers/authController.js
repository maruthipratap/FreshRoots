const User = require('../models/User')
const jwt = require('jsonwebtoken')

// In-memory OTP store { phoneNumber: { otp, expiresAt } }
const otpStore = {}

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc   Send OTP to phone number
// @route  POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body
  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' })
  }
  // Mock OTP — always 1234 in dev
  const otp = '1234'
  otpStore[phoneNumber] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  }
  console.log(`OTP for ${phoneNumber}: ${otp}`)
  res.json({ message: 'OTP sent successfully' })
}

// @desc   Register new user
// @route  POST /api/auth/register
const register = async (req, res) => {
  const { name, phoneNumber, role, location, otp } = req.body

  // Verify OTP
  const stored = otpStore[phoneNumber]
  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber })
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists with this phone number' })
  }

  // Create user
  const user = await User.create({ name, phoneNumber, role, location })

  // Clear OTP
  delete otpStore[phoneNumber]

  const token = generateToken(user._id)
  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      location: user.location,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    }
  })
}

// @desc   Login existing user
// @route  POST /api/auth/login
const login = async (req, res) => {
  const { phoneNumber, otp } = req.body

  // Verify OTP
  const stored = otpStore[phoneNumber]
  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  // Find user
  const user = await User.findOne({ phoneNumber })
  if (!user) {
    return res.status(404).json({ message: 'User not found. Please register first.' })
  }

  // Clear OTP
  delete otpStore[phoneNumber]

  const token = generateToken(user._id)
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      location: user.location,
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus
    }
  })
}

// @desc   Get current logged in user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v')
  res.json(user)
}

// @desc   Update profile
// @route  PATCH /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, location } = req.body
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, location },
    { new: true }
  ).select('-__v')
  res.json(user)
}

// @desc   Farmer requests verification
// @route  PATCH /api/auth/request-verification
const requestVerification = async (req, res) => {
  const user = await User.findById(req.user._id)
  if (user.verificationStatus === 'verified') {
    return res.status(400).json({ message: 'Already verified' })
  }
  user.verificationStatus = 'pending'
  await user.save()
  res.json({ message: 'Verification requested', verificationStatus: 'pending' })
}

// @desc   Admin verifies or rejects a farmer
// @route  PATCH /api/auth/admin/verify/:userId
const verifyFarmer = async (req, res) => {
  const { status } = req.body // 'verified' or 'rejected'
  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.verificationStatus = status
  user.isVerified = status === 'verified'
  await user.save()
  res.json({ message: `Farmer ${status}`, user })
}

module.exports = {
  sendOTP,
  register,
  login,
  getMe,
  updateProfile,
  requestVerification,
  verifyFarmer
}