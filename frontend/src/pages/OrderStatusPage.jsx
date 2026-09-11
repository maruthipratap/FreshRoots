import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getBuyerOrders } from '../services/api'
import { TableRowSkeleton } from '../components/SkeletonLoader'
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  MapPin,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Truck,
  Store
} from 'lucide-react'

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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
      <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse mb-6" />
      {[...Array(3)].map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-neutral-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 font-display flex items-center gap-2.5">
            <ShoppingBag className="h-8 w-8 text-primary-700" />
            My Orders
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Track and manage your fresh produce orders</p>
        </div>
        <Link to="/browse" className="btn-primary text-xs py-2.5 px-4 shadow-sm flex items-center gap-1.5">
          <Sparkles className="h-4 w-4" />
          Browse More
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card rounded-3xl p-16 text-center border border-neutral-200/80 bg-white shadow-sm max-w-md mx-auto my-8">
          <ShoppingBag className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 font-display">No Orders Placed Yet</h3>
          <p className="text-neutral-500 text-sm mt-2">
            You haven't ordered any produce yet. Discover fresh harvests from local farmers!
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
        <div className="space-y-6">
          {orders.map((order) => {
            const steps = ['pending', 'accepted', 'completed']
            const stepIndex = steps.indexOf(order.status)
            const isCancelled = order.status === 'cancelled'

            return (
              <div key={order._id} className="card rounded-2xl p-6 border border-neutral-200/80 bg-white shadow-sm hover:shadow transition-shadow">

                {/* Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-xl font-display">
                      {order.productId?.name || 'Produce Item'}
                    </h3>
                    <p className="text-neutral-500 text-xs font-semibold capitalize mt-0.5">
                      {order.productId?.category || 'Fresh'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge px-3 py-1 text-xs font-bold flex items-center gap-1.5 capitalize ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'accepted' ? 'bg-sky-100 text-sky-800' :
                      order.status === 'completed' ? 'bg-primary-100 text-primary-800' :
                      'bg-accent-100 text-accent-800'
                    }`}>
                      {order.status === 'pending' && <Clock className="h-3.5 w-3.5" />}
                      {order.status === 'accepted' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {order.status === 'completed' && <Package className="h-3.5 w-3.5" />}
                      {order.status === 'cancelled' && <XCircle className="h-3.5 w-3.5" />}
                      {order.status}
                    </span>

                    <span className={`badge px-3 py-1 text-xs font-bold capitalize ${
                      order.paymentStatus === 'paid'
                        ? 'bg-primary-100 text-primary-800 border border-primary-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Visual Step Progress Bar */}
                {!isCancelled && (
                  <div className="mb-6 bg-neutral-50/80 p-4 rounded-xl border border-neutral-100">
                    <div className="flex justify-between text-xs font-bold text-neutral-500 mb-2">
                      <span className={stepIndex >= 0 ? 'text-primary-700' : ''}>Placed</span>
                      <span className={stepIndex >= 1 ? 'text-primary-700' : ''}>Farmer Accepted</span>
                      <span className={stepIndex >= 2 ? 'text-primary-700' : ''}>Fulfilled</span>
                    </div>
                    <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-2 bg-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${((stepIndex + 1) / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Grid Details */}
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-700 bg-neutral-50/60 rounded-xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-1.5"><Package className="h-4 w-4 text-primary-600 shrink-0" /> Quantity: <strong className="text-neutral-900">{order.quantityOrdered} {order.productId?.unit}</strong></div>
                  <div className="flex items-center gap-1.5"><span className="font-bold text-primary-700 text-sm">₹</span> Total Cost: <strong className="text-neutral-900 font-bold text-sm">₹{order.totalPrice}</strong></div>
                  <div className="flex items-center gap-1.5">
                    {order.deliveryType === 'delivery' ? <Truck className="h-4 w-4 text-accent-500 shrink-0" /> : <Store className="h-4 w-4 text-primary-600 shrink-0" />}
                    Fulfillment: <strong className="capitalize text-neutral-900">{order.deliveryType}</strong>
                  </div>
                  <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-neutral-400 shrink-0" /> Date: <strong className="text-neutral-900">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                </div>

                {/* Farmer Info */}
                {order.farmerId && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-600 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary-600" />
                      <span>Farmer: <strong className="text-neutral-800">{order.farmerId.name}</strong></span>
                      {order.farmerId.location && (
                        <span className="text-neutral-500 flex items-center gap-1"><MapPin className="h-3 w-3 text-neutral-400" /> {order.farmerId.location}</span>
                      )}
                    </div>
                    {order.status === 'accepted' && order.farmerId.phoneNumber && (
                      <a href={`tel:${order.farmerId.phoneNumber}`} className="text-primary-700 font-semibold hover:underline flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Call Farmer
                      </a>
                    )}
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