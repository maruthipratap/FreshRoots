const SubscriptionBox = require('../models/SubscriptionBox')
const Subscription = require('../models/Subscription')

// Helper to calculate next delivery date
const getNextDelivery = (frequency) => {
  const date = new Date()
  if (frequency === 'weekly') date.setDate(date.getDate() + 7)
  else if (frequency === 'biweekly') date.setDate(date.getDate() + 14)
  else if (frequency === 'monthly') date.setMonth(date.getMonth() + 1)
  return date
}

// @desc   Farmer creates a subscription box
// @route  POST /api/subscriptions/boxes
const createBox = async (req, res) => {
  const { boxName, description, items, price, frequency, image } = req.body

  if (!boxName || !items || items.length === 0 || !price || !frequency) {
    return res.status(400).json({ message: 'Please fill all required fields' })
  }

  const box = await SubscriptionBox.create({
    farmerId: req.user._id,
    boxName,
    description,
    items,
    price,
    frequency,
    image: image || ''
  })

  res.status(201).json(box)
}

// @desc   Get all active subscription boxes (buyers browse)
// @route  GET /api/subscriptions/boxes
const getBoxes = async (req, res) => {
  const boxes = await SubscriptionBox.find({ isActive: true })
    .populate('farmerId', 'name location isVerified')
    .sort({ createdAt: -1 })
  res.json(boxes)
}

// @desc   Get farmer's own boxes
// @route  GET /api/subscriptions/boxes/farmer
const getFarmerBoxes = async (req, res) => {
  const boxes = await SubscriptionBox.find({ farmerId: req.user._id })
    .sort({ createdAt: -1 })
  res.json(boxes)
}

// @desc   Buyer subscribes to a box
// @route  POST /api/subscriptions/subscribe/:boxId
const subscribeToBox = async (req, res) => {
  const { deliveryType, deliveryAddress } = req.body

  const box = await SubscriptionBox.findById(req.params.boxId)
    .populate('farmerId', 'name location')

  if (!box) return res.status(404).json({ message: 'Box not found' })
  if (!box.isActive) return res.status(400).json({ message: 'This box is no longer available' })

  // Check if already subscribed
  const existing = await Subscription.findOne({
    buyerId: req.user._id,
    boxName: box.boxName,
    farmerId: box.farmerId._id,
    isActive: true
  })
  if (existing) {
    return res.status(400).json({ message: 'You are already subscribed to this box' })
  }

  const subscription = await Subscription.create({
    farmerId: box.farmerId._id,
    buyerId: req.user._id,
    boxName: box.boxName,
    description: box.description,
    items: box.items,
    price: box.price,
    frequency: box.frequency,
    deliveryType: deliveryType || 'pickup',
    deliveryAddress: deliveryAddress || '',
    nextDelivery: getNextDelivery(box.frequency)
  })

  // Increment subscriber count
  await SubscriptionBox.findByIdAndUpdate(req.params.boxId, {
    $inc: { subscriberCount: 1 }
  })

  res.status(201).json({ message: 'Subscribed successfully! 🎉', subscription })
}

// @desc   Get buyer's subscriptions
// @route  GET /api/subscriptions/my
const getMySubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find({ buyerId: req.user._id })
    .populate('farmerId', 'name location phoneNumber isVerified')
    .sort({ startedAt: -1 })
  res.json(subscriptions)
}

// @desc   Get farmer's subscribers
// @route  GET /api/subscriptions/farmer
const getFarmerSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find({
    farmerId: req.user._id,
    isActive: true
  })
    .populate('buyerId', 'name location phoneNumber')
    .sort({ startedAt: -1 })
  res.json(subscriptions)
}

// @desc   Cancel subscription
// @route  PATCH /api/subscriptions/:id/cancel
const cancelSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' })

  if (subscription.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  subscription.isActive = false
  subscription.cancelledAt = new Date()
  await subscription.save()

  // Decrement subscriber count
  await SubscriptionBox.findOneAndUpdate(
    { farmerId: subscription.farmerId, boxName: subscription.boxName },
    { $inc: { subscriberCount: -1 } }
  )

  res.json({ message: 'Subscription cancelled' })
}

// @desc   Delete a box (farmer)
// @route  DELETE /api/subscriptions/boxes/:id
const deleteBox = async (req, res) => {
  const box = await SubscriptionBox.findById(req.params.id)
  if (!box) return res.status(404).json({ message: 'Box not found' })

  if (box.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  await box.deleteOne()
  res.json({ message: 'Box deleted' })
}

module.exports = {
  createBox,
  getBoxes,
  getFarmerBoxes,
  subscribeToBox,
  getMySubscriptions,
  getFarmerSubscriptions,
  cancelSubscription,
  deleteBox
}