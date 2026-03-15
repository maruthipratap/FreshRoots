import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markAsRead, markAllAsRead } from '../services/api'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ))
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read!')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🔔</div>
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-green-600 hover:text-green-800 font-semibold"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔔</div>
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-1">Subscribe to products to get alerts</p>
          <Link
            to="/browse"
            className="mt-4 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`p-4 rounded-2xl border cursor-pointer transition ${
                n.isRead
                  ? 'bg-white border-gray-100'
                  : 'bg-green-50 border-green-200 hover:bg-green-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">
                    {n.type === 'restock' ? '🌱' :
                     n.type === 'order_update' ? '📦' :
                     n.type === 'price_drop' ? '💰' : '🔔'}
                  </div>
                  <div>
                    <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-800 font-semibold'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {n.productId && (
                      <Link
                        to={`/product/${n.productId._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-green-600 hover:text-green-800 font-semibold mt-1 block"
                      >
                        View Product →
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-1 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}