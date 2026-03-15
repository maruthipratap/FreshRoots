const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
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
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  nextDelivery: {
    type: Date,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  cancelledAt: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.model('Subscription', subscriptionSchema)