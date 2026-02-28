import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getBuyerOrders } from '../services/api'

export default function OrderStatusPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await getBuyerOrders(user._id)
      setOrders(res.data)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📋</div>
        <div className="text-gray-500">Loading your orders...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-2">My Orders</h1>
      <p className="text-gray-500 mb-8">Track all your FreshRoots orders</p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-lg font-medium text-gray-700">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Start by browsing fresh products
          </p>
          <Link
            to="/browse"
            className="inline-block mt-4 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const steps = ['pending', 'accepted', 'completed']
            const stepIndex = steps.indexOf(order.status)
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                {/* Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {order.productId?.name}
                    </h3>
                    <p className="text-gray-500 text-sm capitalize">
                      {order.productId?.category}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'pending' ? '⏳' :
                       order.status === 'accepted' ? '✅' :
                       order.status === 'completed' ? '🎉' : '❌'} {order.status}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      💰 {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {!isCancelled && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Order Placed</span>
                      <span>Accepted</span>
                      <span>Completed</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute top-0 left-0 h-2 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                  <div>📦 Qty: <strong>{order.quantityOrdered} {order.productId?.unit}</strong></div>
                  <div>💰 Total: <strong>₹{order.totalPrice}</strong></div>
                  <div>🚚 <strong className="capitalize">{order.deliveryType}</strong></div>
                  <div>📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                </div>

                {/* Farmer info */}
                {order.farmerId && (
                  <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                    <span>👨‍🌾</span>
                    <span>
                      <strong>{order.farmerId.name}</strong>
                      {order.farmerId.location && ` · 📍 ${order.farmerId.location}`}
                      {order.status === 'accepted' && (
                        <span className="ml-2 text-green-600 font-semibold">
                          · 📞 {order.farmerId.phoneNumber}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}