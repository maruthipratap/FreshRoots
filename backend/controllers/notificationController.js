const Notification = require('../models/Notification')
const Product = require('../models/Product')

// @desc   Subscribe to product restock alert
// @route  POST /api/notifications/subscribe/:productId
const subscribeToProduct = async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  // Check if already subscribed
  if (product.subscribers.includes(req.user._id)) {
    return res.status(400).json({ message: 'Already subscribed' })
  }

  product.subscribers.push(req.user._id)
  await product.save()
  res.json({ message: 'Subscribed! You will be notified when restocked.' })
}

// @desc   Unsubscribe from product restock alert
// @route  DELETE /api/notifications/subscribe/:productId
const unsubscribeFromProduct = async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  product.subscribers = product.subscribers.filter(
    id => id.toString() !== req.user._id.toString()
  )
  await product.save()
  res.json({ message: 'Unsubscribed successfully' })
}

// @desc   Get all notifications for user
// @route  GET /api/notifications
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .populate('productId', 'name images category')
    .sort({ createdAt: -1 })
    .limit(50)
  res.json(notifications)
}

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  })
  res.json({ count })
}

// @desc   Mark notification as read
// @route  PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true })
  res.json({ message: 'Marked as read' })
}

// @desc   Mark all notifications as read
// @route  PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  )
  res.json({ message: 'All marked as read' })
}

// Helper — send restock notifications to all subscribers
const sendRestockNotifications = async (product) => {
  if (!product.subscribers || product.subscribers.length === 0) return

  const notifications = product.subscribers.map(userId => ({
    userId,
    type: 'restock',
    message: `🌱 ${product.name} is back in stock! ${product.quantityAvailable} ${product.unit} available now.`,
    productId: product._id
  }))

  await Notification.insertMany(notifications)
}

module.exports = {
  subscribeToProduct,
  unsubscribeFromProduct,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  sendRestockNotifications
}