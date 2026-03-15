const mongoose = require('mongoose')

const subscriptionBoxSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  boxName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  ],
  price: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('SubscriptionBox', subscriptionBoxSchema)