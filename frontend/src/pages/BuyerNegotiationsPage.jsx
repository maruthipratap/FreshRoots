import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBuyerNegotiations, buyerRespondToNegotiation } from '../services/api'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  countered: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  ordered: 'bg-purple-100 text-purple-700'
}

const statusEmoji = {
  pending: '⏳',
  countered: '🔄',
  accepted: '✅',
  rejected: '❌',
  ordered: '📦'
}

export default function BuyerNegotiationsPage() {
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(null)

  useEffect(() => {
    fetchNegotiations()
  }, [])

  const fetchNegotiations = async () => {
    try {
      const res = await getBuyerNegotiations()
      setNegotiations(res.data)
    } catch {
      toast.error('Failed to load negotiations')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id, action) => {
    setResponding(id + action)
    try {
      const res = await buyerRespondToNegotiation(id, { action })
      if (action === 'accept') {
        toast.success('Deal accepted! Order placed automatically 🎉')
      } else {
        toast.success('Counter offer rejected')
      }
      fetchNegotiations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to respond')
    } finally {
      setResponding(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🤝</div>
        <div className="text-gray-500">Loading negotiations...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">My Negotiations</h1>
          <p className="text-gray-500 mt-1">{negotiations.length} total negotiations</p>
        </div>
        <Link
          to="/browse"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
        >
          + New Deal
        </Link>
      </div>

      {negotiations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-lg font-medium">No negotiations yet</p>
          <p className="text-sm mt-1">Browse products and request a bulk deal</p>
          <Link
            to="/browse"
            className="mt-6 inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((neg) => (
            <div key={neg._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              {/* Header */}
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden">
                    {neg.productId?.images?.[0] ? (
                      <img src={neg.productId.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{neg.productId?.name}</div>
                    <div className="text-sm text-gray-500">
                      👨‍🌾 {neg.farmerId?.name} · 📍 {neg.farmerId?.location}
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[neg.status]}`}>
                  {statusEmoji[neg.status]} {neg.status}
                </span>
              </div>

              {/* Your request */}
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Your Request
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-800">{neg.requestedQuantity}</div>
                    <div className="text-xs text-gray-400">{neg.productId?.unit}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">₹{neg.requestedPrice}</div>
                    <div className="text-xs text-gray-400">your price</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-800">
                      ₹{neg.requestedQuantity * neg.requestedPrice}
                    </div>
                    <div className="text-xs text-gray-400">total</div>
                  </div>
                </div>
                {neg.buyerNote && (
                  <div className="text-xs text-gray-500 mt-2 italic">"{neg.buyerNote}"</div>
                )}
              </div>

              {/* Counter offer */}
              {neg.status === 'countered' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
                  <div className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">
                    🔄 Farmer's Counter Offer
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-3">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {neg.counterQuantity || neg.requestedQuantity}
                      </div>
                      <div className="text-xs text-gray-400">{neg.productId?.unit}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-700">₹{neg.counterPrice}</div>
                      <div className="text-xs text-gray-400">counter price</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        ₹{(neg.counterQuantity || neg.requestedQuantity) * neg.counterPrice}
                      </div>
                      <div className="text-xs text-gray-400">total</div>
                    </div>
                  </div>
                  {neg.farmerNote && (
                    <div className="text-xs text-gray-500 mb-3 italic">"{neg.farmerNote}"</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(neg._id, 'accept')}
                      disabled={responding === neg._id + 'accept'}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition text-sm"
                    >
                      {responding === neg._id + 'accept' ? '⏳' : '✅ Accept Deal'}
                    </button>
                    <button
                      onClick={() => handleRespond(neg._id, 'reject')}
                      disabled={responding === neg._id + 'reject'}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 rounded-xl transition text-sm"
                    >
                      {responding === neg._id + 'reject' ? '⏳' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              )}

              {/* Accepted / Ordered */}
              {(neg.status === 'accepted' || neg.status === 'ordered') && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <span className="text-green-700 font-semibold text-sm">
                    {neg.status === 'ordered'
                      ? '📦 Order placed automatically!'
                      : '✅ Deal accepted by farmer!'}
                  </span>
                </div>
              )}

              {/* Rejected */}
              {neg.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <span className="text-red-600 font-semibold text-sm">
                    ❌ Negotiation rejected
                    {neg.farmerNote && ` — "${neg.farmerNote}"`}
                  </span>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-3">
                {new Date(neg.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}