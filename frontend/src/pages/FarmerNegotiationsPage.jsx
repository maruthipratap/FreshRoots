import { useState, useEffect } from 'react'
import { getFarmerNegotiations, respondToNegotiation } from '../services/api'
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

export default function FarmerNegotiationsPage() {
  const [negotiations, setNegotiations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCounter, setActiveCounter] = useState(null)
  const [counterForm, setCounterForm] = useState({ counterPrice: '', counterQuantity: '', farmerNote: '' })
  const [responding, setResponding] = useState(null)

  useEffect(() => {
    fetchNegotiations()
  }, [])

  const fetchNegotiations = async () => {
    try {
      const res = await getFarmerNegotiations()
      setNegotiations(res.data)
    } catch {
      toast.error('Failed to load negotiations')
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id, action) => {
    if (action === 'counter' && !counterForm.counterPrice) {
      toast.error('Enter a counter price')
      return
    }
    setResponding(id + action)
    try {
      await respondToNegotiation(id, {
        action,
        counterPrice: Number(counterForm.counterPrice),
        counterQuantity: counterForm.counterQuantity ? Number(counterForm.counterQuantity) : null,
        farmerNote: counterForm.farmerNote
      })
      if (action === 'accept') toast.success('Deal accepted! ✅')
      else if (action === 'reject') toast.success('Negotiation rejected')
      else toast.success('Counter offer sent! 🔄')
      setActiveCounter(null)
      setCounterForm({ counterPrice: '', counterQuantity: '', farmerNote: '' })
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

  const pendingCount = negotiations.filter(n => n.status === 'pending').length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Bulk Deal Requests</h1>
          <p className="text-gray-500 mt-1">
            {pendingCount > 0 && (
              <span className="text-yellow-600 font-semibold">{pendingCount} pending · </span>
            )}
            {negotiations.length} total
          </p>
        </div>
      </div>

      {negotiations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🤝</div>
          <p className="text-lg font-medium">No negotiation requests yet</p>
          <p className="text-sm mt-1">Buyers will send bulk deal requests here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((neg) => (
            <div key={neg._id} className={`bg-white rounded-2xl shadow-sm border p-6 ${
              neg.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'
            }`}>

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
                      🛒 {neg.buyerId?.name} · 📍 {neg.buyerId?.location}
                    </div>
                    <div className="text-xs text-gray-400">📱 {neg.buyerId?.phoneNumber}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[neg.status]}`}>
                  {statusEmoji[neg.status]} {neg.status}
                </span>
              </div>

              {/* Buyer's request */}
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Buyer's Request
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-800">{neg.requestedQuantity}</div>
                    <div className="text-xs text-gray-400">{neg.productId?.unit}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">₹{neg.requestedPrice}</div>
                    <div className="text-xs text-gray-400">offered price</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-400 line-through">
                      ₹{neg.productId?.pricePerUnit}
                    </div>
                    <div className="text-xs text-gray-400">your price</div>
                  </div>
                </div>
                {neg.buyerNote && (
                  <div className="text-xs text-gray-500 mt-2 italic bg-white rounded-lg p-2">
                    "{neg.buyerNote}"
                  </div>
                )}
              </div>

              {/* Action buttons for pending */}
              {neg.status === 'pending' && (
                <>
                  {activeCounter === neg._id ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                      <div className="text-sm font-semibold text-blue-800">Send Counter Offer</div>
                      <input
                        type="number"
                        value={counterForm.counterPrice}
                        onChange={(e) => setCounterForm({ ...counterForm, counterPrice: e.target.value })}
                        placeholder="Your counter price (₹)"
                        className="w-full border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                      <input
                        type="number"
                        value={counterForm.counterQuantity}
                        onChange={(e) => setCounterForm({ ...counterForm, counterQuantity: e.target.value })}
                        placeholder={`Quantity (leave blank for ${neg.requestedQuantity} ${neg.productId?.unit})`}
                        className="w-full border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                      <input
                        value={counterForm.farmerNote}
                        onChange={(e) => setCounterForm({ ...counterForm, farmerNote: e.target.value })}
                        placeholder="Message to buyer (optional)"
                        className="w-full border border-blue-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(neg._id, 'counter')}
                          disabled={responding === neg._id + 'counter'}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition text-sm"
                        >
                          {responding === neg._id + 'counter' ? '⏳' : '🔄 Send Counter'}
                        </button>
                        <button
                          onClick={() => setActiveCounter(null)}
                          className="px-4 py-2 border-2 border-gray-200 text-gray-500 rounded-xl text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleRespond(neg._id, 'accept')}
                        disabled={responding === neg._id + 'accept'}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl transition text-sm"
                      >
                        {responding === neg._id + 'accept' ? '⏳' : '✅ Accept Deal'}
                      </button>
                      <button
                        onClick={() => {
                          setActiveCounter(neg._id)
                          setCounterForm({ counterPrice: '', counterQuantity: '', farmerNote: '' })
                        }}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 rounded-xl transition text-sm"
                      >
                        🔄 Counter Offer
                      </button>
                      <button
                        onClick={() => handleRespond(neg._id, 'reject')}
                        disabled={responding === neg._id + 'reject'}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 rounded-xl transition text-sm"
                      >
                        {responding === neg._id + 'reject' ? '⏳' : '❌ Reject'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Ordered status */}
              {neg.status === 'ordered' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                  <span className="text-purple-700 font-semibold text-sm">
                    📦 Order placed automatically!
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