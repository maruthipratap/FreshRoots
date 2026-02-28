const Order = require('../models/Order')
const Product = require('../models/Product')

// @desc   Place an order
// @route  POST /api/orders
const placeOrder = async (req, res) => {
  const { productId, quantityOrdered, deliveryType, deliveryAddress, notes } = req.body

  if (!productId || !quantityOrdered || !deliveryType) {
    return res.status(400).json({ message: 'productId, quantityOrdered and deliveryType are required' })
  }

  // Find the product
  const product = await Product.findById(productId)
  if (!product) {
    return res.status(404).json({ message: 'Product not found' })
  }

  // Check if enough quantity is available
  if (product.quantityAvailable < quantityOrdered) {
    return res.status(400).json({
      message: `Only ${product.quantityAvailable} ${product.unit} available`
    })
  }

  // Calculate total price
  const totalPrice = product.pricePerUnit * quantityOrdered

  // Create the order
  const order = await Order.create({
    productId,
    buyerId: req.user._id,
    farmerId: product.farmerId,
    quantityOrdered,
    totalPrice,
    deliveryType,
    deliveryAddress: deliveryAddress || '',
    notes: notes || ''
  })

  // Reduce product quantity
  product.quantityAvailable -= quantityOrdered
  await product.save()

  // Return order with full details
  const populatedOrder = await Order.findById(order._id)
    .populate('productId', 'name category unit pricePerUnit')
    .populate('buyerId', 'name phoneNumber')
    .populate('farmerId', 'name phoneNumber location')

  res.status(201).json(populatedOrder)
}

// @desc   Get all orders for a farmer
// @route  GET /api/orders/farmer/:farmerId
const getFarmerOrders = async (req, res) => {
  const orders = await Order.find({ farmerId: req.params.farmerId })
    .populate('productId', 'name category unit')
    .populate('buyerId', 'name phoneNumber location')
    .sort({ createdAt: -1 })

  res.json(orders)
}

// @desc   Get all orders for a buyer
// @route  GET /api/orders/buyer/:buyerId
const getBuyerOrders = async (req, res) => {
  const orders = await Order.find({ buyerId: req.params.buyerId })
    .populate('productId', 'name category unit pricePerUnit')
    .populate('farmerId', 'name phoneNumber location')
    .sort({ createdAt: -1 })

  res.json(orders)
}

// @desc   Update order status (farmer accepts/completes/cancels)
// @route  PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body

  const validStatuses = ['accepted', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` })
  }

  const order = await Order.findById(req.params.id)
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  // Only the farmer of this order can update status
  if (order.farmerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this order' })
  }

  order.status = status
  await order.save()

  const updated = await Order.findById(order._id)
    .populate('productId', 'name category unit')
    .populate('buyerId', 'name phoneNumber')
    .populate('farmerId', 'name phoneNumber')

  res.json(updated)
}

// @desc   Update payment status (mock payment)
// @route  PATCH /api/orders/:id/payment
const updatePaymentStatus = async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  // Only the buyer can pay
  if (order.buyerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  order.paymentStatus = 'paid'
  await order.save()

  res.json({ message: '✅ Payment successful!', order })
}

module.exports = {
  placeOrder,
  getFarmerOrders,
  getBuyerOrders,
  updateOrderStatus,
  updatePaymentStatus
}