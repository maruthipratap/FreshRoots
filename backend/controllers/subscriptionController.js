const SubscriptionBox = require('../models/SubscriptionBox')
const Subscription = require('../models/Subscription')
const { asyncHandler } = require('../middleware/errorMiddleware')

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
const createBox = asyncHandler(async (req, res) => {
  const { boxName, description, items, price, frequency, image } = req.body

  // Validate items are correct and only contain whitelisted fields
  const sanitizedItems = Array.isArray(items)
    ? items.map(item => ({
        name: typeof item.name === 'string' ? item.name.trim() : '',
        quantity: typeof item.quantity === 'number' ? item.quantity : 0,
        unit: typeof item.unit === 'string' ? item.unit.trim() : ''
      })).filter(item => item.name && item.quantity > 0 && item.unit)
    : []

  if (!boxName || typeof boxName !== 'string' || boxName.trim() === '' ||
      sanitizedItems.length === 0 ||
      typeof price !== 'number' || price <= 0 ||
      !frequency) {
    return res.status(400).json({ message: 'Please fill all required fields with valid values' })
  }

  const box = await SubscriptionBox.create({
    farmerId: req.user._id,
    boxName: boxName.trim(),
    description: typeof description === 'string' ? description.trim() : '',
    items: sanitizedItems,
    price,
    frequency,
    image: typeof image === 'string' ? image.trim() : ''
  })

  res.status(201).json(box)
})

// @desc   Get all active subscription boxes (buyers browse)
// @route  GET /api/subscriptions/boxes
const getBoxes = asyncHandler(async (req, res) => {
  const boxes = await SubscriptionBox.find({ isActive: true })
    .populate('farmerId', 'name location isVerified')
    .sort({ createdAt: -1 })
  res.json(boxes)
})

// @desc   Get farmer's own boxes
// @route  GET /api/subscriptions/boxes/farmer
const getFarmerBoxes = asyncHandler(async (req, res) => {
  const boxes = await SubscriptionBox.find({ farmerId: req.user._id })
    .sort({ createdAt: -1 })
  res.json(boxes)
})

// @desc   Buyer subscribes to a box
// @route  POST /api/subscriptions/subscribe/:boxId
const subscribeToBox = asyncHandler(async (req, res) => {
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
})

// @desc   Get buyer's subscriptions
// @route  GET /api/subscriptions/my
const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ buyerId: req.user._id })
    .populate('farmerId', 'name location phoneNumber isVerified')
    .sort({ startedAt: -1 })
  res.json(subscriptions)
})

// @desc   Get farmer's subscribers
// @route  GET /api/subscriptions/farmer
const getFarmerSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    farmerId: req.user._id,
    isActive: true
  })
    .populate('buyerId', 'name location phoneNumber')
    .sort({ startedAt: -1 })
  res.json(subscriptions)
})

// @desc   Cancel subscription
// @route  PATCH /api/subscriptions/:id/cancel
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
  if (!subscription) return res.status(404).json({ message: 'Subscription not found' })

  if (subscription.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  if (!subscription.isActive) {
    return res.status(400).json({ message: 'Subscription is already cancelled' })
  }

  subscription.isActive = false
  subscription.cancelledAt = new Date()
  await subscription.save()

  // Decrement subscriber count only if box exists and it's greater than 0
  const box = await SubscriptionBox.findOne({
    farmerId: subscription.farmerId,
    boxName: subscription.boxName
  })
  if (box && box.subscriberCount > 0) {
    box.subscriberCount -= 1
    await box.save()
  }

  res.json({ message: 'Subscription cancelled' })
})

// @desc   Delete a box (farmer)
// @route  DELETE /api/subscriptions/boxes/:id
const deleteBox = asyncHandler(async (req, res) => {
  const box = await SubscriptionBox.findById(req.params.id)
  if (!box) return res.status(404).json({ message: 'Box not found' })

  if (box.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  await box.deleteOne()
  res.json({ message: 'Box deleted' })
})

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