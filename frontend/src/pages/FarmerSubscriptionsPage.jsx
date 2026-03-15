import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFarmerBoxes, getFarmerSubscriptions, deleteSubscriptionBox } from '../services/api'
import toast from 'react-hot-toast'

const frequencyLabel = {
  weekly: 'Every Week',
  biweekly: 'Every 2 Weeks',
  monthly: 'Every Month'
}

export default function FarmerSubscriptionsPage() {
  const [boxes, setBoxes] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('boxes')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [boxRes, subRes] = await Promise.all([
        getFarmerBoxes(),
        getFarmerSubscriptions()
      ])
      setBoxes(boxRes.data)
      setSubscribers(subRes.data)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBox = async (id) => {
    if (!window.confirm('Delete this subscription box?')) return
    try {
      await deleteSubscriptionBox(id)
      setBoxes(boxes.filter(b => b._id !== id))
      toast.success('Box deleted')
    } catch {
      toast.error('Failed to delete box')
    }
  }

  const totalRevenue = subscribers.reduce((sum, s) => sum + s.price, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📦</div>
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Subscription Boxes</h1>
          <p className="text-gray-500 mt-1">
            {boxes.length} boxes · {subscribers.length} active subscribers · ₹{totalRevenue}/cycle
          </p>
        </div>
        <Link
          to="/farmer/create-box"
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-semibold transition"
        >
          + Create Box
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['boxes', 'subscribers'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl font-semibold text-sm capitalize transition ${
              activeTab === tab
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {tab === 'boxes' ? `📦 My Boxes (${boxes.length})` : `👥 Subscribers (${subscribers.length})`}
          </button>
        ))}
      </div>

      {/* Boxes tab */}
      {activeTab === 'boxes' && (
        <>
          {boxes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-medium">No subscription boxes yet</p>
              <Link
                to="/farmer/create-box"
                className="mt-6 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
              >
                + Create First Box
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {boxes.map((box) => (
                <div key={box._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{box.boxName}</h3>
                      <div className="text-sm text-blue-600 font-semibold mt-1">
                        {frequencyLabel[box.frequency]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-700">₹{box.price}</div>
                      <div className="text-xs text-gray-400">{box.subscriberCount} subscribers</div>
                    </div>
                  </div>
                  <div className="space-y-1 mb-4">
                    {box.items.map((item, i) => (
                      <div key={i} className="text-sm text-gray-500">
                        • {item.name} — {item.quantity} {item.unit}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDeleteBox(box._id)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold py-2 rounded-xl transition"
                  >
                    🗑️ Delete Box
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Subscribers tab */}
      {activeTab === 'subscribers' && (
        <>
          {subscribers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-lg font-medium">No subscribers yet</p>
              <p className="text-sm mt-1">Share your subscription boxes to get subscribers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subscribers.map((sub) => (
                <div key={sub._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-semibold text-gray-800">{sub.buyerId?.name}</div>
                      <div className="text-sm text-gray-500">
                        📱 {sub.buyerId?.phoneNumber} · 📍 {sub.buyerId?.location}
                      </div>
                      <div className="text-sm text-green-600 font-semibold mt-1">
                        📦 {sub.boxName} · {frequencyLabel[sub.frequency]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-700">₹{sub.price}</div>
                      <div className="text-xs text-gray-400">
                        Next: {new Date(sub.nextDelivery).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short'
                        })}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {sub.deliveryType === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}