import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getHarvests, prebookHarvest } from '../services/api'
import toast from 'react-hot-toast'

const categoryEmoji = {
  'vegetables': '🥦', 'fruits': '🍎', 'milk & dairy': '🥛',
  'meat': '🥩', 'eggs': '🥚', 'crops': '🌾', 'farm-made products': '🫙'
}

export default function HarvestBrowsePage() {
  const { user } = useAuth()
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingId, setBookingId] = useState(null)
  const [bookingForm, setBookingForm] = useState({ quantity: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchHarvests()
  }, [])

  const fetchHarvests = async () => {
    try {
      const res = await getHarvests()
      setHarvests(res.data)
    } catch {
      toast.error('Failed to load harvests')
    } finally {
      setLoading(false)
    }
  }

  const handlePrebook = async (harvestId) => {
    if (!bookingForm.quantity || bookingForm.quantity <= 0) {
      toast.error('Enter a valid quantity')
      return
    }
    setSubmitting(true)
    try {
      await prebookHarvest(harvestId, {
        quantity: Number(bookingForm.quantity),
        notes: bookingForm.notes
      })
      toast.success('Pre-booking confirmed! Farmer will contact you. 🌱')
      setBookingId(null)
      setBookingForm({ quantity: '', notes: '' })
      fetchHarvests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pre-book')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📅</div>
        <div className="text-gray-500">Loading upcoming harvests...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-800">Upcoming Harvests</h1>
        <p className="text-gray-500 mt-1">
          Pre-book fresh produce directly from farmers before they harvest
        </p>
      </div>

      {harvests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium">No upcoming harvests</p>
          <p className="text-sm mt-1">Check back soon — farmers will post their upcoming harvests here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {harvests.map((harvest) => {
            const totalBooked = harvest.prebookings.reduce((sum, p) => sum + p.quantity, 0)
            const remainingQty = harvest.estimatedQuantity - totalBooked
            const progressPercent = Math.round((totalBooked / harvest.estimatedQuantity) * 100)
            const daysUntil = Math.ceil(
              (new Date(harvest.expectedHarvestDate) - new Date()) / (1000 * 60 * 60 * 24)
            )
            const alreadyBooked = harvest.prebookings.find(
              p => p.buyerId?._id === user?._id || p.buyerId === user?._id
            )
            const emoji = categoryEmoji[harvest.category] || '🌿'
            const isFull = remainingQty <= 0

            return (
              <div key={harvest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{harvest.productName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500 capitalize">{harvest.category}</span>
                        {harvest.farmerId?.isVerified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                            ✅ Verified
                          </span>
                        )}
                        {harvest.status === 'ready' && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                            🌟 Ready Now!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      ₹{harvest.pricePerUnit}/{harvest.unit}
                    </div>
                    <div className="text-xs text-gray-400">pre-booking price</div>
                  </div>
                </div>

                {/* Farmer info */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <span>👨‍🌾 {harvest.farmerId?.name}</span>
                  {harvest.farmerId?.location && (
                    <span>· 📍 {harvest.farmerId.location}</span>
                  )}
                </div>

                {harvest.description && (
                  <p className="text-gray-500 text-sm mb-4">{harvest.description}</p>
                )}

                {/* Date + quantity */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-500 font-semibold mb-1">Harvest Date</div>
                    <div className="font-bold text-blue-700 text-sm">
                      {new Date(harvest.expectedHarvestDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      {daysUntil > 0 ? `${daysUntil} days away` : 'Today!'}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-green-500 font-semibold mb-1">Available</div>
                    <div className="font-bold text-green-700 text-sm">
                      {remainingQty} {harvest.unit}
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      of {harvest.estimatedQuantity} {harvest.unit}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{harvest.prebookings.length} pre-bookings</span>
                    <span>{progressPercent}% booked</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        progressPercent >= 80 ? 'bg-red-400' :
                        progressPercent >= 50 ? 'bg-orange-400' : 'bg-green-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Pre-booking form or status */}
                {alreadyBooked ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <span className="text-green-700 font-semibold text-sm">
                      ✅ You pre-booked {alreadyBooked.quantity} {harvest.unit}
                    </span>
                  </div>
                ) : isFull ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <span className="text-red-600 font-semibold text-sm">
                      ❌ Fully booked
                    </span>
                  </div>
                ) : bookingId === harvest._id ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-semibold text-green-800">
                      Pre-book this harvest
                    </div>
                    <input
                      type="number"
                      value={bookingForm.quantity}
                      onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                      placeholder={`Quantity (max ${remainingQty} ${harvest.unit})`}
                      max={remainingQty}
                      min={1}
                      className="w-full border border-green-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                    />
                    <input
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="Notes for farmer (optional)"
                      className="w-full border border-green-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrebook(harvest._id)}
                        disabled={submitting}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-xl transition text-sm"
                      >
                        {submitting ? '⏳ Booking...' : '✅ Confirm Pre-booking'}
                      </button>
                      <button
                        onClick={() => setBookingId(null)}
                        className="px-4 py-2 border-2 border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setBookingId(harvest._id)}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition"
                  >
                    📅 Pre-book Now
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}