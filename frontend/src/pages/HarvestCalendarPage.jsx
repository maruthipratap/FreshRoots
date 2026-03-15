import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFarmerHarvests, updateHarvestStatus, deleteHarvest } from '../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  upcoming: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600'
}

const statusEmoji = {
  upcoming: '🌱',
  ready: '✅',
  completed: '📦',
  cancelled: '❌'
}

export default function HarvestCalendarPage() {
  const { user } = useAuth()
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHarvests()
  }, [])

  const fetchHarvests = async () => {
    try {
      const res = await getFarmerHarvests(user._id)
      setHarvests(res.data)
    } catch {
      toast.error('Failed to load harvests')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateHarvestStatus(id, status)
      setHarvests(harvests.map(h =>
        h._id === id ? { ...h, status } : h
      ))
      toast.success(`Harvest marked as ${status}! ✅`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this harvest listing?')) return
    try {
      await deleteHarvest(id)
      setHarvests(harvests.filter(h => h._id !== id))
      toast.success('Harvest deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const totalPrebookings = harvests.reduce((sum, h) => sum + h.prebookings.length, 0)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📅</div>
        <div className="text-gray-500">Loading harvests...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Harvest Calendar</h1>
          <p className="text-gray-500 mt-1">
            {harvests.length} listings · {totalPrebookings} pre-bookings
          </p>
        </div>
        <Link
          to="/farmer/add-harvest"
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-semibold transition"
        >
          + Post Harvest
        </Link>
      </div>

      {harvests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium">No harvest listings yet</p>
          <p className="text-sm mt-1">Post your upcoming harvests so buyers can pre-book</p>
          <Link
            to="/farmer/add-harvest"
            className="mt-6 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            + Post First Harvest
          </Link>
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

            return (
              <div key={harvest._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* Header row */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-gray-800">{harvest.productName}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[harvest.status]}`}>
                        {statusEmoji[harvest.status]} {harvest.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1 capitalize">{harvest.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      ₹{harvest.pricePerUnit}/{harvest.unit}
                    </div>
                    <div className="text-xs text-gray-400">pre-booking price</div>
                  </div>
                </div>

                {/* Date + quantity */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-500 font-semibold mb-1">Harvest Date</div>
                    <div className="font-bold text-blue-700">
                      {new Date(harvest.expectedHarvestDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-blue-400 mt-1">
                      {daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? 'Today!' : 'Past date'}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-green-500 font-semibold mb-1">Quantity</div>
                    <div className="font-bold text-green-700">
                      {harvest.estimatedQuantity} {harvest.unit}
                    </div>
                    <div className="text-xs text-green-400 mt-1">
                      {remainingQty} {harvest.unit} remaining
                    </div>
                  </div>
                </div>

                {/* Pre-booking progress */}
                {harvest.prebookings.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{harvest.prebookings.length} pre-bookings</span>
                      <span>{totalBooked}/{harvest.estimatedQuantity} {harvest.unit} booked ({progressPercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Pre-bookings list */}
                {harvest.prebookings.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Pre-bookings:
                    </div>
                    <div className="space-y-2">
                      {harvest.prebookings.map((booking, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              {booking.buyerId?.name || 'Buyer'}
                            </span>
                            {booking.notes && (
                              <span className="text-xs text-gray-400 ml-2">"{booking.notes}"</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {booking.quantity} {harvest.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {harvest.status === 'upcoming' && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleStatusUpdate(harvest._id, 'ready')}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                    >
                      ✅ Mark as Ready
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(harvest._id, 'cancelled')}
                      className="bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(harvest._id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
                {harvest.status === 'ready' && (
                  <button
                    onClick={() => handleStatusUpdate(harvest._id, 'completed')}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                  >
                    📦 Mark as Completed
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