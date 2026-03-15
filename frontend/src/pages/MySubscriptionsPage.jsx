import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMySubscriptions, cancelSubscription } from '../services/api'
import toast from 'react-hot-toast'

const frequencyLabel = {
  weekly: 'Every Week',
  biweekly: 'Every 2 Weeks',
  monthly: 'Every Month'
}

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const res = await getMySubscriptions()
      setSubscriptions(res.data)
    } catch {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return
    setCancelling(id)
    try {
      await cancelSubscription(id)
      toast.success('Subscription cancelled')
      fetchSubscriptions()
    } catch {
      toast.error('Failed to cancel')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📦</div>
        <div className="text-gray-500">Loading subscriptions...</div>
      </div>
    </div>
  )

  const active = subscriptions.filter(s => s.isActive)
  const cancelled = subscriptions.filter(s => !s.isActive)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Subscriptions</h1>
          <p className="text-gray-500 mt-1">{active.length} active</p>
        </div>
        <Link
          to="/subscription-boxes"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          + Browse Boxes
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg font-medium">No subscriptions yet</p>
          <p className="text-sm mt-1">Subscribe to a farm box for regular fresh produce</p>
          <Link
            to="/subscription-boxes"
            className="mt-6 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Browse Subscription Boxes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {active.map((sub) => (
            <div key={sub._id} className="bg-white rounded-2xl shadow-sm border border-green-100 p-6">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{sub.boxName}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    👨‍🌾 {sub.farmerId?.name} · 📍 {sub.farmerId?.location}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    📱 {sub.farmerId?.phoneNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">₹{sub.price}</div>
                  <div className="text-xs text-gray-400">{frequencyLabel[sub.frequency]}</div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="text-xs font-bold text-gray-500 mb-2">Box Contents</div>
                <div className="grid grid-cols-2 gap-1">
                  {sub.items.map((item, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      • {item.name} — {item.quantity} {item.unit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Next delivery */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="bg-blue-50 rounded-xl px-4 py-2">
                  <div className="text-xs text-blue-500 font-semibold">Next Delivery</div>
                  <div className="font-bold text-blue-700 text-sm">
                    {new Date(sub.nextDelivery).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {sub.deliveryType === 'pickup' ? '🏪 Pickup' : `🚚 Delivery to ${sub.deliveryAddress}`}
                </div>
              </div>

              <button
                onClick={() => handleCancel(sub._id)}
                disabled={cancelling === sub._id}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl transition text-sm"
              >
                {cancelling === sub._id ? '⏳ Cancelling...' : '❌ Cancel Subscription'}
              </button>
            </div>
          ))}

          {/* Cancelled subscriptions */}
          {cancelled.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-400 mb-3">Cancelled</h3>
              {cancelled.map((sub) => (
                <div key={sub._id} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-3 opacity-60">
                  <div className="font-semibold text-gray-600">{sub.boxName}</div>
                  <div className="text-sm text-gray-400">
                    Cancelled on {new Date(sub.cancelledAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}