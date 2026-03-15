const mongoose = require('mongoose')

const negotiationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true
  },
  requestedPrice: {
    type: Number,
    required: true
  },
  counterPrice: {
    type: Number,
    default: null
  },
  counterQuantity: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'countered', 'accepted', 'rejected', 'ordered'],
    default: 'pending'
  },
  buyerNote: {
    type: String,
    default: ''
  },
  farmerNote: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Negotiation', negotiationSchema)