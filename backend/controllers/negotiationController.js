const Negotiation = require('../models/Negotiation')
const Product = require('../models/Product')
const Order = require('../models/Order')

// @desc   Buyer creates a negotiation request
// @route  POST /api/negotiations
const createNegotiation = async (req, res) => {
  const { productId, requestedQuantity, requestedPrice, buyerNote } = req.body

  if (!productId || !requestedQuantity || !requestedPrice) {
    return res.status(400).json({ message: 'Please fill all required fields' })
  }

  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  // Check if buyer already has pending negotiation for this product
  const existing = await Negotiation.findOne({
    productId,
    buyerId: req.user._id,
    status: { $in: ['pending', 'countered'] }
  })
  if (existing) {
    return res.status(400).json({ message: 'You already have an active negotiation for this product' })
  }

  const negotiation = await Negotiation.create({
    productId,
    buyerId: req.user._id,
    farmerId: product.farmerId,
    requestedQuantity,
    requestedPrice,
    buyerNote: buyerNote || ''
  })

  await negotiation.populate('productId', 'name images unit pricePerUnit')
  await negotiation.populate('buyerId', 'name phoneNumber location')

  res.status(201).json(negotiation)
}

// @desc   Farmer responds - accept, reject or counter
// @route  PATCH /api/negotiations/:id/respond
const respondToNegotiation = async (req, res) => {
  const { action, counterPrice, counterQuantity, farmerNote } = req.body
  // action: 'accept' | 'reject' | 'counter'

  const negotiation = await Negotiation.findById(req.params.id)
    .populate('productId', 'name unit pricePerUnit')
    .populate('buyerId', 'name phoneNumber')

  if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' })

  if (negotiation.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  if (action === 'accept') {
    negotiation.status = 'accepted'
    negotiation.farmerNote = farmerNote || ''
  } else if (action === 'reject') {
    negotiation.status = 'rejected'
    negotiation.farmerNote = farmerNote || ''
  } else if (action === 'counter') {
    if (!counterPrice) return res.status(400).json({ message: 'Enter a counter price' })
    negotiation.status = 'countered'
    negotiation.counterPrice = counterPrice
    negotiation.counterQuantity = counterQuantity || negotiation.requestedQuantity
    negotiation.farmerNote = farmerNote || ''
  }

  negotiation.updatedAt = new Date()
  await negotiation.save()
  res.json(negotiation)
}

// @desc   Buyer accepts or rejects counter offer
// @route  PATCH /api/negotiations/:id/buyer-respond
const buyerRespond = async (req, res) => {
  const { action } = req.body
  // action: 'accept' | 'reject'

  const negotiation = await Negotiation.findById(req.params.id)
    .populate('productId')

  if (!negotiation) return res.status(404).json({ message: 'Negotiation not found' })

  if (negotiation.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  if (negotiation.status !== 'countered') {
    return res.status(400).json({ message: 'No counter offer to respond to' })
  }

  if (action === 'reject') {
    negotiation.status = 'rejected'
    negotiation.updatedAt = new Date()
    await negotiation.save()
    return res.json(negotiation)
  }

  if (action === 'accept') {
    // Auto create order with negotiated price
    const finalPrice = negotiation.counterPrice
    const finalQuantity = negotiation.counterQuantity || negotiation.requestedQuantity

    const order = await Order.create({
      productId: negotiation.productId._id,
      buyerId: negotiation.buyerId,
      farmerId: negotiation.farmerId,
      quantityOrdered: finalQuantity,
      totalPrice: finalPrice * finalQuantity,
      deliveryType: 'pickup',
      status: 'pending',
      paymentStatus: 'pending',
      notes: `Negotiated deal — ₹${finalPrice}/${negotiation.productId.unit}`
    })

    // Reduce product quantity
    await Product.findByIdAndUpdate(
      negotiation.productId._id,
      { $inc: { quantityAvailable: -finalQuantity } }
    )

    negotiation.status = 'ordered'
    negotiation.updatedAt = new Date()
    await negotiation.save()

    return res.json({ negotiation, order })
  }
}

// @desc   Get buyer's negotiations
// @route  GET /api/negotiations/buyer
const getBuyerNegotiations = async (req, res) => {
  const negotiations = await Negotiation.find({ buyerId: req.user._id })
    .populate('productId', 'name images unit pricePerUnit category')
    .populate('farmerId', 'name location phoneNumber')
    .sort({ updatedAt: -1 })
  res.json(negotiations)
}

// @desc   Get farmer's negotiations
// @route  GET /api/negotiations/farmer
const getFarmerNegotiations = async (req, res) => {
  const negotiations = await Negotiation.find({ farmerId: req.user._id })
    .populate('productId', 'name images unit pricePerUnit category')
    .populate('buyerId', 'name location phoneNumber')
    .sort({ updatedAt: -1 })
  res.json(negotiations)
}

module.exports = {
  createNegotiation,
  respondToNegotiation,
  buyerRespond,
  getBuyerNegotiations,
  getFarmerNegotiations
}