import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGroupBuys, joinGroupBuy } from '../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  open: 'bg-green-100 text-green-700',
  locked: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600'
}

export default function GroupBuyPage() {
  const { user } = useAuth()
  const [groupBuys, setGroupBuys] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)

  useEffect(() => {
    fetchGroupBuys()
  }, [])

  const fetchGroupBuys = async () => {
    try {
      const res = await getGroupBuys()
      setGroupBuys(res.data)
    } catch {
      toast.error('Failed to load group buys')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (id) => {
    setJoining(id)
    try {
      const res = await joinGroupBuy(id, {})
      toast.success(res.data.message)
      fetchGroupBuys()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join')
    } finally {
      setJoining(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">👥</div>
        <div className="text-gray-500">Loading group buys...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Group Buying</h1>
          <p className="text-gray-500 mt-1">
            Pool orders with others to unlock bulk prices
          </p>
        </div>
        <Link
          to="/my-group-buys"
          className="text-sm text-green-600 hover:text-green-800 font-semibold"
        >
          My Group Buys →
        </Link>
      </div>

      {groupBuys.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-lg font-medium">No active group buys</p>
          <p className="text-sm mt-1">Browse products and start a group buy!</p>
          <Link
            to="/browse"
            className="mt-6 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groupBuys.map((gb) => {
            const progressPercent = Math.round((gb.currentQuantity / gb.targetQuantity) * 100)
            const remaining = gb.targetQuantity - gb.currentQuantity
            const alreadyJoined = gb.participants.find(
              p => p.userId?._id === user?._id || p.userId === user?._id
            )
            const isCreator = gb.creatorId === user?._id ||
              gb.creatorId?._id === user?._id
            const daysLeft = Math.ceil(
              (new Date(gb.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
            )
            const discount = Math.round(
              ((gb.productId?.pricePerUnit - gb.unlockedPrice) / gb.productId?.pricePerUnit) * 100
            )

            return (
              <div key={gb._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden">
                      {gb.productId?.images?.[0] ? (
                        <img src={gb.productId.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🌿</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{gb.title}</h3>
                      <div className="text-sm text-gray-500">
                        {gb.productId?.name} · {gb.productId?.category}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        👨‍🌾 {gb.farmerId?.name} · 📍 {gb.farmerId?.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        ₹{gb.productId?.pricePerUnit}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        ₹{gb.unlockedPrice}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 font-bold">
                      {discount}% OFF when unlocked!
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      per {gb.productId?.unit}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">
                      {gb.participants.length} joined · {gb.currentQuantity}/{gb.targetQuantity} {gb.productId?.unit}
                    </span>
                    <span className={`font-bold ${
                      progressPercent >= 80 ? 'text-green-600' :
                      progressPercent >= 50 ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        progressPercent >= 100 ? 'bg-green-500' :
                        progressPercent >= 80 ? 'bg-green-400' :
                        progressPercent >= 50 ? 'bg-orange-400' : 'bg-purple-400'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Need {remaining} more {gb.productId?.unit} · {daysLeft} days left
                  </div>
                </div>

                {/* Per person info */}
                <div className="flex gap-3 mb-4 flex-wrap">
                  <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-semibold">
                    👤 {gb.quantityPerPerson} {gb.productId?.unit} per person
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                    💰 Save ₹{((gb.productId?.pricePerUnit - gb.unlockedPrice) * gb.quantityPerPerson).toFixed(0)} per person
                  </span>
                  {daysLeft <= 2 && (
                    <span className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded-full font-semibold">
                      ⚡ Expires soon!
                    </span>
                  )}
                </div>

                {/* Participants */}
                {gb.participants.length > 0 && (
                  <div className="text-xs text-gray-400 mb-4">
                    Joined: {gb.participants.slice(0, 5).map(p => p.userId?.name || 'Someone').join(', ')}
                    {gb.participants.length > 5 && ` + ${gb.participants.length - 5} more`}
                  </div>
                )}

                {/* Action */}
                {alreadyJoined ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                    <span className="text-purple-700 font-semibold text-sm">
                      ✅ You joined! ({alreadyJoined.quantity} {gb.productId?.unit})
                    </span>
                  </div>
                ) : isCreator ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <span className="text-green-700 font-semibold text-sm">
                      👑 You created this group buy
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(gb._id)}
                    disabled={joining === gb._id}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
                  >
                    {joining === gb._id ? '⏳ Joining...' : `👥 Join — Get ${gb.quantityPerPerson} ${gb.productId?.unit} at ₹${gb.unlockedPrice}`}
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