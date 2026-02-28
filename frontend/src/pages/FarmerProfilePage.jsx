import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProductsByFarmer, getFarmerOrders } from '../services/api'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function FarmerProfilePage() {
  const { user, login, token } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    location: user.location || ''
  })

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
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    setSaving(true)
    try {
      const res = await api.patch(`/auth/profile`, form)
      // Update user in context + localStorage
      login(res.data, token)
      toast.success('Profile updated! ✅')
      setEditing(false)
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Stats calculations
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalPrice, 0)

  const completedOrders = orders.filter(o => o.status === 'completed').length
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">👨‍🌾</div>
        <div className="text-gray-500">Loading profile...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800 mb-8">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-4xl">
              👨‍🌾
            </div>
            <div>
              {editing ? (
                <div className="space-y-3">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 font-semibold text-lg"
                    placeholder="Your name"
                  />
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 w-full"
                    placeholder="Your location"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-gray-500">📍 {user.location || 'Location not set'}</p>
                  <p className="text-gray-500 text-sm">📱 {user.phoneNumber}</p>
                </>
              )}
            </div>
          </div>

          {/* Edit / Save buttons */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-xl font-semibold text-sm transition"
                >
                  {saving ? '⏳ Saving...' : '✅ Save'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setForm({ name: user.name, location: user.location || '' })
                  }}
                  className="border-2 border-gray-200 text-gray-500 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="border-2 border-green-200 text-green-700 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-green-50 transition"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-4 flex gap-2">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            🌾 Farmer
          </span>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Products Listed', value: products.length, icon: '📦', color: 'text-green-600' },
          { label: 'Total Orders', value: orders.length, icon: '📋', color: 'text-blue-600' },
          { label: 'Completed', value: completedOrders, icon: '✅', color: 'text-green-600' },
          { label: 'Revenue Earned', value: `₹${totalRevenue}`, icon: '💰', color: 'text-orange-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            My Products ({products.length})
          </h3>
          <Link
            to="/farmer/add-product"
            className="text-sm bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl font-semibold transition"
          >
            + Add New
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🌱</div>
            <p>No products yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      p.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    ₹{p.pricePerUnit}/{p.unit} · {p.quantityAvailable} {p.unit} left
                  </div>
                </div>
                <Link
                  to={`/farmer/edit-product/${p._id}`}
                  className="text-sm text-green-600 hover:text-green-800 font-semibold"
                >
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            Recent Orders
          </h3>
          <span className="text-sm text-gray-500">
            {pendingOrders > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">
                ⏳ {pendingOrders} pending
              </span>
            )}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {o.productId?.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    👤 {o.buyerId?.name} · ₹{o.totalPrice}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  o.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                  o.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
            {orders.length > 5 && (
              <Link
                to="/farmer/dashboard"
                className="block text-center text-sm text-green-600 hover:text-green-800 font-semibold pt-2"
              >
                View all {orders.length} orders →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}