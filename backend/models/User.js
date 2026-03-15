const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: [true, 'Role is required']
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none'
  },
  farmStory: {
    farmName: { type: String, default: '' },
    bio: { type: String, default: '' },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: '' },
    establishedYear: { type: Number, default: null },
    location: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)