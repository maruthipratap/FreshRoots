import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyGroupBuys, cancelGroupBuy } from '../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  open: 'bg-green-100 text-green-700',
  locked: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600'
}

const statusEmoji = {
  open: '🟢',
  locked: '🔒',
  completed: '✅',
  expired: '⏰',
  cancelled: '❌'
}

export default function MyGroupBuysPage() {
  const { user } = useAuth()
  const [groupBuys, setGroupBuys] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchGroupBuys()
  }, [])

  const fetchGroupBuys = async () => {
    try {
      const res = await getMyGroupBuys()
      setGroupBuys(res.data)
    } catch {
      toast.error('Failed to load group buys')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this group buy?')) return
    setCancelling(id)
    try {
      await cancelGroupBuy(id)
      toast.success('Group buy cancelled')
      fetchGroupBuys()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">👥</div>
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Group Buys</h1>
          <p className="text-gray-500 mt-1">{groupBuys.length} total</p>
        </div>
        <Link
          to="/group-buys"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          Browse All
        </Link>
      </div>

      {groupBuys.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-lg font-medium">No group buys yet</p>
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
            const isCreator = gb.creatorId === user?._id || gb.creatorId?._id === user?._id
            const myParticipation = gb.participants.find(
              p => p.userId?._id === user?._id || p.userId === user?._id
            )

            return (
              <div key={gb._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{gb.title}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[gb.status]}`}>
                        {statusEmoji[gb.status]} {gb.status}
                      </span>
                      {isCreator && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                          👑 Creator
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {gb.productId?.name} · {gb.productId?.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">₹{gb.unlockedPrice}</div>
                    <div className="text-xs text-gray-400 line-through">₹{gb.productId?.pricePerUnit}</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{gb.participants.length} participants</span>
                    <span>{gb.currentQuantity}/{gb.targetQuantity} {gb.productId?.unit} ({progressPercent}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                {myParticipation && (
                  <div className="text-sm text-purple-600 font-semibold mb-3">
                    Your order: {myParticipation.quantity} {gb.productId?.unit} at ₹{gb.unlockedPrice}
                  </div>
                )}

                {gb.status === 'completed' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center mb-3">
                    <span className="text-purple-700 font-semibold text-sm">
                      🎉 Deal unlocked! Orders placed for all participants!
                    </span>
                  </div>
                )}

                {gb.status === 'open' && isCreator && (
                  <button
                    onClick={() => handleCancel(gb._id)}
                    disabled={cancelling === gb._id}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold py-2 rounded-xl transition"
                  >
                    {cancelling === gb._id ? '⏳' : '❌ Cancel Group Buy'}
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