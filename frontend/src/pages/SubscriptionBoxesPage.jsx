import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubscriptionBoxes, subscribeToBox } from '../services/api'
import toast from 'react-hot-toast'

const frequencyLabel = {
  weekly: '📅 Every Week',
  biweekly: '📅 Every 2 Weeks',
  monthly: '📅 Every Month'
}

export default function SubscriptionBoxesPage() {
  const navigate = useNavigate()
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(true)
  const [subscribingId, setSubscribingId] = useState(null)
  const [subscribeForm, setSubscribeForm] = useState({
    deliveryType: 'pickup',
    deliveryAddress: ''
  })

  useEffect(() => {
    fetchBoxes()
  }, [])

  const fetchBoxes = async () => {
    try {
      const res = await getSubscriptionBoxes()
      setBoxes(res.data)
    } catch {
      toast.error('Failed to load subscription boxes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (boxId) => {
    try {
      await subscribeToBox(boxId, subscribeForm)
      toast.success('Subscribed successfully! 🎉')
      setSubscribingId(null)
      navigate('/my-subscriptions')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📦</div>
        <div className="text-gray-500">Loading subscription boxes...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Subscription Boxes</h1>
        <p className="text-gray-500 mt-1">
          Subscribe to get fresh farm produce delivered regularly
        </p>
      </div>

      {boxes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-lg font-medium">No subscription boxes yet</p>
          <p className="text-sm mt-1">Farmers will add boxes here soon</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {boxes.map((box) => (
            <div key={box._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{box.boxName}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    👨‍🌾 {box.farmerId?.name} · 📍 {box.farmerId?.location}
                  </div>
                </div>
                {box.farmerId?.isVerified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ✅ Verified
                  </span>
                )}
              </div>

              {box.description && (
                <p className="text-gray-500 text-sm mb-4">{box.description}</p>
              )}

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  What's Inside
                </div>
                <div className="space-y-1">
                  {box.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">• {item.name}</span>
                      <span className="text-gray-500 font-semibold">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequency + Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                  {frequencyLabel[box.frequency]}
                </span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">₹{box.price}</div>
                  <div className="text-xs text-gray-400">
                    per {box.frequency === 'weekly' ? 'week' : box.frequency === 'biweekly' ? '2 weeks' : 'month'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-4">
                {box.subscriberCount} subscriber{box.subscriberCount !== 1 ? 's' : ''}
              </div>

              {/* Subscribe form */}
              {subscribingId === box._id ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <div className="text-sm font-semibold text-green-800">Delivery Preference</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['pickup', 'delivery'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSubscribeForm({ ...subscribeForm, deliveryType: type })}
                        className={`py-2 rounded-xl border-2 text-sm font-semibold capitalize transition ${
                          subscribeForm.deliveryType === type
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-gray-200 text-gray-500'
                        }`}
                      >
                        {type === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                      </button>
                    ))}
                  </div>
                  {subscribeForm.deliveryType === 'delivery' && (
                    <input
                      value={subscribeForm.deliveryAddress}
                      onChange={(e) => setSubscribeForm({ ...subscribeForm, deliveryAddress: e.target.value })}
                      placeholder="Your delivery address"
                      className="w-full border border-green-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubscribe(box._id)}
                      className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-xl transition text-sm"
                    >
                      ✅ Confirm Subscribe
                    </button>
                    <button
                      onClick={() => setSubscribingId(null)}
                      className="px-4 py-2 border-2 border-gray-200 text-gray-500 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSubscribingId(box._id)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
                >
                  📦 Subscribe Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}