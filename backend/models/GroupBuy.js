const mongoose = require('mongoose')

const groupBuySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  targetQuantity: {
    type: Number,
    required: true
  },
  quantityPerPerson: {
    type: Number,
    required: true
  },
  unlockedPrice: {
    type: Number,
    required: true
  },
  currentQuantity: {
    type: Number,
    default: 0
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      quantity: { type: Number, required: true },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['open', 'locked', 'completed', 'expired', 'cancelled'],
    default: 'open'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('GroupBuy', groupBuySchema)