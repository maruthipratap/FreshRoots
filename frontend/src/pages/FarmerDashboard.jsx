import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getProductsByFarmer, getFarmerOrders, updateOrderStatus, deleteProduct } from '../services/api'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        getProductsByFarmer(user._id),
        getFarmerOrders(user._id)
      ])
      setProducts(pRes.data)
      setOrders(oRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success(`Order ${status}!`)
      fetchData()
    } catch {
      toast.error('Failed to update order')
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(productId)
      toast.success('Product deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🌱</div>
        <div className="text-gray-500">Loading your farm...</div>
      </div>
    </div>
  )

  const pendingOrders = orders.filter(o => o.status === 'pending')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            Welcome, {user.name} 👨‍🌾
          </h1>
          <p className="text-gray-500 mt-1">📍 {user.location || 'Location not set'}</p>
        </div>
        <Link
          to="/farmer/add-product"
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Products', value: products.length, icon: '📦' },
          { label: 'Total Orders', value: orders.length, icon: '📋' },
          { label: 'Pending', value: pendingOrders.length, icon: '⏳' },
          { label: 'Completed', value: orders.filter(o => o.status === 'completed').length, icon: '✅' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm text-center border border-gray-100">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-green-700">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {['products', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 font-semibold capitalize transition border-b-2 -mb-px ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'products' ? '📦' : '📋'} {t}
            {t === 'orders' && pendingOrders.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {tab === 'products' && (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🌱</div>
              <p className="text-lg font-medium">No products yet</p>
              <p className="text-sm mt-1">Add your first product to start selling</p>
              <Link
                to="/farmer/add-product"
                className="inline-block mt-4 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
              >
                + Add First Product
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <span className="text-xs text-gray-500 capitalize">{p.category}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <div>💰 ₹{p.pricePerUnit}/{p.unit}</div>
                    <div>📦 {p.quantityAvailable} {p.unit} available</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm py-2 rounded-xl transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-lg font-medium">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">
                        {order.productId?.name}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        💰 {order.paymentStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>🛒 Buyer: <strong>{order.buyerId?.name}</strong> · {order.buyerId?.phoneNumber}</div>
                      <div>📦 Qty: {order.quantityOrdered} {order.productId?.unit} · Total: <strong>₹{order.totalPrice}</strong></div>
                      <div>🚚 {order.deliveryType}</div>
                      <div>📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'accepted')}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                      >
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition"
                      >
                        ❌ Decline
                      </button>
                    </div>
                  )}
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                    >
                      🎉 Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}