const mongoose = require('mongoose')

const harvestSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  estimatedQuantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch'],
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  expectedHarvestDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ready', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  prebookings: [
    {
      buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      quantity: { type: Number, required: true },
      notes: { type: String, default: '' },
      bookedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Harvest', harvestSchema)