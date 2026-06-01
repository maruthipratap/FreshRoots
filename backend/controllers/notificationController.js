const Notification = require('../models/Notification')
const Product = require('../models/Product')
const { asyncHandler } = require('../middleware/errorMiddleware')

// @desc   Subscribe to product restock alert
// @route  POST /api/notifications/subscribe/:productId
const subscribeToProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  // Check if already subscribed
  if (product.subscribers.includes(req.user._id)) {
    return res.status(400).json({ message: 'Already subscribed' })
  }

  product.subscribers.push(req.user._id)
  await product.save()
  res.json({ message: 'Subscribed! You will be notified when restocked.' })
})

// @desc   Unsubscribe from product restock alert
// @route  DELETE /api/notifications/subscribe/:productId
const unsubscribeFromProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  product.subscribers = product.subscribers.filter(
    id => id.toString() !== req.user._id.toString()
  )
  await product.save()
  res.json({ message: 'Unsubscribed successfully' })
})

// @desc   Get all notifications for user
// @route  GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .populate('productId', 'name images category')
    .sort({ createdAt: -1 })
    .limit(50)
  res.json(notifications)
})

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.user._id,
    isRead: false
  })
  res.json({ count })
})

// @desc   Mark notification as read
// @route  PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' })
  }

  // Check ownership of the notification to prevent IDOR
  if (notification.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to modify this notification' })
  }

  notification.isRead = true
  await notification.save()
  res.json({ message: 'Marked as read' })
})

// @desc   Mark all notifications as read
// @route  PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  )
  res.json({ message: 'All marked as read' })
})

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