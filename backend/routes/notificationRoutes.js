const express = require('express')
const router = express.Router()
const { protect, buyerOnly } = require('../middleware/authMiddleware')
const {
  subscribeToProduct,
  unsubscribeFromProduct,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController')

router.post('/subscribe/:productId', protect, buyerOnly, subscribeToProduct)
router.delete('/subscribe/:productId', protect, buyerOnly, unsubscribeFromProduct)
router.get('/', protect, getNotifications)
router.get('/unread-count', protect, getUnreadCount)
router.patch('/read-all', protect, markAllAsRead)
router.patch('/:id/read', protect, markAsRead)

module.exports = router