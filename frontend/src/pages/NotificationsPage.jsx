import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markAsRead, markAllAsRead } from '../services/api'
import { TableRowSkeleton } from '../components/SkeletonLoader'
import {
  Bell,
  CheckCheck,
  Sprout,
  Package,
  Tag,
  ArrowRight,
  Clock
} from 'lucide-react'
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
      toast.error('Failed to mark notification as read')
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
      <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
      {[...Array(4)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-neutral-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 font-display flex items-center gap-2.5">
            <Bell className="h-8 w-8 text-primary-700" />
            Alerts & Notifications
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread restock and deal notifications` : 'All alerts up to date'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn-outline py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 border-primary-300 text-primary-700 hover:bg-primary-50"
          >
            <CheckCheck className="h-4 w-4 text-primary-600" />
            Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card rounded-3xl p-16 text-center border border-neutral-200 bg-white max-w-md mx-auto my-8 shadow-sm">
          <Bell className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 font-display">No Notifications</h3>
          <p className="text-neutral-500 text-sm mt-2">
            Subscribe to out-of-stock products or active group buys to receive real-time notifications.
          </p>
          <Link
            to="/browse"
            className="btn-primary mt-6 inline-flex items-center gap-2 text-sm py-2.5 px-6"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkAsRead(n._id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-neutral-200/80 shadow-sm'
                  : 'bg-primary-50/80 border-primary-200 shadow-md hover:bg-primary-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    n.type === 'restock' ? 'bg-primary-100 text-primary-700' :
                    n.type === 'order_update' ? 'bg-accent-100 text-accent-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {n.type === 'restock' ? <Sprout className="h-5 w-5" /> :
                     n.type === 'order_update' ? <Package className="h-5 w-5" /> :
                     <Tag className="h-5 w-5" />}
                  </div>

                  <div>
                    <p className={`text-sm ${n.isRead ? 'text-neutral-700 font-medium' : 'text-neutral-900 font-bold'}`}>
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1.5">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(n.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {n.productId && (
                      <Link
                        to={`/product/${n.productId._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:underline mt-2"
                      >
                        <span>View Product Listing</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {!n.isRead && (
                  <span className="h-2.5 w-2.5 bg-accent-500 rounded-full shrink-0 mt-1" title="Unread" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}