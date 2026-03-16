const GroupBuy = require('../models/GroupBuy')
const Product = require('../models/Product')
const Order = require('../models/Order')

// @desc   Create a group buy
// @route  POST /api/groupbuy
const createGroupBuy = async (req, res) => {
  const { productId, title, targetQuantity, quantityPerPerson, unlockedPrice, expiresInDays } = req.body

  if (!productId || !title || !targetQuantity || !quantityPerPerson || !unlockedPrice) {
    return res.status(400).json({ message: 'Please fill all required fields' })
  }

  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  if (unlockedPrice >= product.pricePerUnit) {
    return res.status(400).json({ message: 'Unlocked price must be lower than listed price' })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7))

  const groupBuy = await GroupBuy.create({
    productId,
    creatorId: req.user._id,
    farmerId: product.farmerId,
    title,
    targetQuantity,
    quantityPerPerson,
    unlockedPrice,
    expiresAt
  })

  await groupBuy.populate('productId', 'name images unit pricePerUnit category')
  await groupBuy.populate('creatorId', 'name location')

  res.status(201).json(groupBuy)
}

// @desc   Get all open group buys
// @route  GET /api/groupbuy
const getGroupBuys = async (req, res) => {
  const groupBuys = await GroupBuy.find({
    status: 'open',
    expiresAt: { $gt: new Date() }
  })
    .populate('productId', 'name images unit pricePerUnit category')
    .populate('creatorId', 'name location')
    .populate('farmerId', 'name location isVerified')
    .populate('participants.userId', 'name')
    .sort({ createdAt: -1 })

  res.json(groupBuys)
}

// @desc   Join a group buy
// @route  POST /api/groupbuy/:id/join
const joinGroupBuy = async (req, res) => {
  const { quantity } = req.body

  const groupBuy = await GroupBuy.findById(req.params.id)
    .populate('productId')

  if (!groupBuy) return res.status(404).json({ message: 'Group buy not found' })
  if (groupBuy.status !== 'open') {
    return res.status(400).json({ message: 'This group buy is no longer open' })
  }
  if (new Date() > groupBuy.expiresAt) {
    groupBuy.status = 'expired'
    await groupBuy.save()
    return res.status(400).json({ message: 'This group buy has expired' })
  }

  // Check already joined
  const alreadyJoined = groupBuy.participants.find(
    p => p.userId.toString() === req.user._id.toString()
  )
  if (alreadyJoined) {
    return res.status(400).json({ message: 'You have already joined this group buy' })
  }

  // Check if creator is joining their own group buy
  if (groupBuy.creatorId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot join your own group buy' })
  }

  const finalQuantity = quantity || groupBuy.quantityPerPerson

  groupBuy.participants.push({
    userId: req.user._id,
    quantity: finalQuantity
  })
  groupBuy.currentQuantity += finalQuantity

  // Check if target reached
  if (groupBuy.currentQuantity >= groupBuy.targetQuantity) {
    groupBuy.status = 'locked'

    // Auto place orders for all participants
    const orders = groupBuy.participants.map(p => ({
      productId: groupBuy.productId._id,
      buyerId: p.userId,
      farmerId: groupBuy.farmerId,
      quantityOrdered: p.quantity,
      totalPrice: groupBuy.unlockedPrice * p.quantity,
      deliveryType: 'pickup',
      status: 'pending',
      paymentStatus: 'pending',
      notes: `Group Buy Deal — ₹${groupBuy.unlockedPrice}/${groupBuy.productId.unit} (${groupBuy.title})`
    }))

    await Order.insertMany(orders)

    // Reduce product quantity
    await Product.findByIdAndUpdate(
      groupBuy.productId._id,
      { $inc: { quantityAvailable: -groupBuy.currentQuantity } }
    )

    groupBuy.status = 'completed'
  }

  await groupBuy.save()

  const message = groupBuy.status === 'completed'
    ? '🎉 Target reached! Orders placed for everyone!'
    : `Joined! ${groupBuy.targetQuantity - groupBuy.currentQuantity} more needed to unlock deal.`

  res.json({ message, groupBuy })
}

// @desc   Get user's group buys (created + joined)
// @route  GET /api/groupbuy/my
const getMyGroupBuys = async (req, res) => {
  const groupBuys = await GroupBuy.find({
    $or: [
      { creatorId: req.user._id },
      { 'participants.userId': req.user._id }
    ]
  })
    .populate('productId', 'name images unit pricePerUnit category')
    .populate('farmerId', 'name location')
    .populate('participants.userId', 'name')
    .sort({ createdAt: -1 })

  res.json(groupBuys)
}

// @desc   Cancel a group buy (creator only)
// @route  PATCH /api/groupbuy/:id/cancel
const cancelGroupBuy = async (req, res) => {
  const groupBuy = await GroupBuy.findById(req.params.id)
  if (!groupBuy) return res.status(404).json({ message: 'Group buy not found' })

  if (groupBuy.creatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the creator can cancel' })
  }

  groupBuy.status = 'cancelled'
  await groupBuy.save()
  res.json({ message: 'Group buy cancelled' })
}
// @desc   Get group buys for farmer's products
// @route  GET /api/groupbuy/farmer
const getFarmerGroupBuys = async (req, res) => {
  const groupBuys = await GroupBuy.find({ farmerId: req.user._id })
    .populate('productId', 'name images unit pricePerUnit category')
    .populate('creatorId', 'name location phoneNumber')
    .populate('participants.userId', 'name phoneNumber')
    .sort({ createdAt: -1 })
  res.json(groupBuys)
}
// @desc   Farmer counters a group buy price
// @route  PATCH /api/groupbuy/:id/counter
const counterGroupBuy = async (req, res) => {
  const { counterPrice } = req.body
  const groupBuy = await GroupBuy.findById(req.params.id)
    .populate('productId', 'name unit pricePerUnit')

  if (!groupBuy) return res.status(404).json({ message: 'Group buy not found' })
  if (groupBuy.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }
  if (groupBuy.status !== 'open') {
    return res.status(400).json({ message: 'Can only counter open group buys' })
  }

  groupBuy.unlockedPrice = counterPrice
  await groupBuy.save()

  res.json({ message: 'Counter price updated! Buyers will see the new price.', groupBuy })
}
module.exports = {
  createGroupBuy, getGroupBuys, joinGroupBuy,
  getMyGroupBuys, cancelGroupBuy, getFarmerGroupBuys,
  counterGroupBuy
}