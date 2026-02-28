const jwt = require('jsonwebtoken')
const User = require('../models/User')

// In-memory OTP store (resets when server restarts - fine for MVP)
const otpStore = {}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// @desc   Send OTP
// @route  POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  const { phoneNumber } = req.body

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' })
  }

  // Mock OTP - always 1234 in development
  const otp = '1234'
  otpStore[phoneNumber] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // expires in 5 minutes
  }

  console.log(`📱 OTP for ${phoneNumber}: ${otp}`)

  res.json({
    message: 'OTP sent successfully',
    devOtp: '1234'
  })
}

// @desc   Register new user
// @route  POST /api/auth/register
const register = async (req, res) => {
  const { name, phoneNumber, role, location, otp } = req.body

  // Check all fields
  if (!name || !phoneNumber || !role || !otp) {
    return res.status(400).json({ message: 'Please fill all fields' })
  }

  // Validate OTP
  const storedOtp = otpStore[phoneNumber]
  if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  // Check if user already exists
  const userExists = await User.findOne({ phoneNumber })
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' })
  }

  // Create user
  const user = await User.create({
    name,
    phoneNumber,
    role,
    location: location || '',
    isVerified: true
  })

  // Delete OTP after use
  delete otpStore[phoneNumber]

  res.status(201).json({
    _id: user._id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
    location: user.location,
    token: generateToken(user._id)
  })
}

// @desc   Login user
// @route  POST /api/auth/login
const login = async (req, res) => {
  const { phoneNumber, otp } = req.body

  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' })
  }

  // Validate OTP
  const storedOtp = otpStore[phoneNumber]
  if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
    return res.status(400).json({ message: 'Invalid or expired OTP' })
  }

  // Find user
  const user = await User.findOne({ phoneNumber })
  if (!user) {
    return res.status(404).json({ message: 'User not found. Please register first.' })
  }

  // Delete OTP after use
  delete otpStore[phoneNumber]

  res.json({
    _id: user._id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
    location: user.location,
    token: generateToken(user._id)
  })
}

// @desc   Get current logged in user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user)
}

module.exports = { sendOTP, register, login, getMe }