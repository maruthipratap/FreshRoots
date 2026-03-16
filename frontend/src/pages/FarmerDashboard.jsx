import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  getProductsByFarmer, getFarmerOrders, updateOrderStatus,
  deleteProduct, getFarmerGroupBuys, counterGroupBuyPrice
} from '../services/api'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [groupBuys, setGroupBuys] = useState([])
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(true)

  // Counter offer state
  const [counteringId, setCounteringId] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [submittingCounter, setSubmittingCounter] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pRes, oRes, gRes] = await Promise.all([
        getProductsByFarmer(user._id),
        getFarmerOrders(user._id),
        getFarmerGroupBuys()
      ])
      setProducts(pRes.data)
      setOrders(oRes.data)
      setGroupBuys(gRes.data)
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

  const handleCounterGroupBuy = async (groupBuyId) => {
    if (!counterPrice || Number(counterPrice) <= 0) {
      toast.error('Enter a valid counter price')
      return
    }
    setSubmittingCounter(true)
    try {
      // Update unlocked price via API
      await counterGroupBuyPrice(groupBuyId, Number(counterPrice))
      toast.success('Counter price sent to all participants! 🔄')
      setCounteringId(null)
      setCounterPrice('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send counter')
    } finally {
      setSubmittingCounter(false)
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
  const openGroupBuys = groupBuys.filter(g => g.status === 'open')

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
      <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
        {['products', 'orders', 'groupbuys'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 px-4 font-semibold capitalize transition border-b-2 -mb-px whitespace-nowrap ${
              tab === t
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'products' ? '📦 Products' :
             t === 'orders' ? '📋 Orders' : '👥 Group Buys'}
            {t === 'orders' && pendingOrders.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
            {t === 'groupbuys' && openGroupBuys.length > 0 && (
              <span className="ml-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center">
                {openGroupBuys.length}
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
                    <Link
                      to={`/farmer/edit-product/${p._id}`}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm py-2 rounded-xl transition text-center"
                    >
                      Edit
                    </Link>
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

      {/* Group Buys Tab */}
      {tab === 'groupbuys' && (
        <div className="space-y-4">
          {groupBuys.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-lg font-medium">No group buys yet</p>
              <p className="text-sm mt-1">Buyers will create group buys for your products here</p>
            </div>
          ) : (
            groupBuys.map((gb) => {
              const progressPercent = Math.round((gb.currentQuantity / gb.targetQuantity) * 100)
              const discount = Math.round(
                ((gb.productId?.pricePerUnit - gb.unlockedPrice) / gb.productId?.pricePerUnit) * 100
              )
              const daysLeft = Math.ceil(
                (new Date(gb.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div key={gb._id} className={`bg-white rounded-2xl p-5 shadow-sm border ${
                  gb.status === 'open' ? 'border-purple-100' : 'border-gray-100'
                }`}>

                  {/* Header */}
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800">{gb.title}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          gb.status === 'open' ? 'bg-green-100 text-green-700' :
                          gb.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                          gb.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {gb.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        📦 {gb.productId?.name} · {gb.participants?.length || 0} participants
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Started by {gb.creatorId?.name} · {gb.creatorId?.phoneNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-600">
                        ₹{gb.unlockedPrice}/{gb.productId?.unit}
                      </div>
                      <div className="text-xs text-gray-400 line-through">
                        ₹{gb.productId?.pricePerUnit} listed
                      </div>
                      <div className="text-xs text-green-600 font-semibold">
                        {discount}% off when unlocked
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{gb.currentQuantity}/{gb.targetQuantity} {gb.productId?.unit}</span>
                      <span>{progressPercent}% · {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Participants list */}
                  {gb.participants?.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                        Participants
                      </div>
                      <div className="space-y-1">
                        {gb.participants.map((p, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              👤 {p.userId?.name || 'Buyer'}
                            </span>
                            <span className="text-gray-500 font-semibold">
                              {p.quantity} {gb.productId?.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed message */}
                  {gb.status === 'completed' && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center mb-3">
                      <span className="text-purple-700 font-semibold text-sm">
                        🎉 Target reached! Orders placed for all {gb.participants?.length} participants!
                      </span>
                    </div>
                  )}

                  {/* Counter offer section - only for open group buys */}
                  {gb.status === 'open' && (
                    <>
                      {counteringId === gb._id ? (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                          <div className="text-sm font-semibold text-orange-800">
                            🔄 Send Counter Price to All Participants
                          </div>
                          <p className="text-xs text-orange-600">
                            Buyers requested ₹{gb.unlockedPrice}/{gb.productId?.unit}.
                            Your listed price is ₹{gb.productId?.pricePerUnit}/{gb.productId?.unit}.
                            Enter your counter offer:
                          </p>
                          <input
                            type="number"
                            value={counterPrice}
                            onChange={(e) => setCounterPrice(e.target.value)}
                            placeholder={`Your price (₹ per ${gb.productId?.unit})`}
                            min={gb.unlockedPrice}
                            max={gb.productId?.pricePerUnit}
                            className="w-full border border-orange-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                          />
                          {counterPrice && (
                            <div className="text-xs text-gray-500">
                              Total deal value: ₹{(Number(counterPrice) * gb.targetQuantity).toLocaleString()}
                              for {gb.targetQuantity} {gb.productId?.unit}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCounterGroupBuy(gb._id)}
                              disabled={submittingCounter}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl transition text-sm"
                            >
                              {submittingCounter ? '⏳ Sending...' : '🔄 Send Counter'}
                            </button>
                            <button
                              onClick={() => {
                                setCounteringId(null)
                                setCounterPrice('')
                              }}
                              className="px-4 py-2 border-2 border-gray-200 text-gray-500 rounded-xl text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setCounteringId(gb._id)
                              setCounterPrice('')
                            }}
                            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-xl transition text-sm"
                          >
                            🔄 Counter Price
                          </button>
                          <div className="flex-1 bg-purple-50 text-purple-600 font-semibold py-2 rounded-xl text-sm text-center">
                            ⏳ Waiting for {gb.targetQuantity - gb.currentQuantity} more {gb.productId?.unit}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}