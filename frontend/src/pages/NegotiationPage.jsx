import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProductById, createNegotiation } from '../services/api'

export default function NegotiationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    requestedQuantity: '',
    requestedPrice: '',
    buyerNote: ''
  })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id)
      setProduct(res.data)
    } catch {
      toast.error('Product not found')
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.requestedQuantity || !form.requestedPrice) {
      toast.error('Please fill quantity and price')
      return
    }
    if (Number(form.requestedPrice) >= product.pricePerUnit) {
      toast.error(`Your price must be lower than ₹${product.pricePerUnit}/${product.unit}`)
      return
    }
    setSubmitting(true)
    try {
      await createNegotiation({
        productId: id,
        requestedQuantity: Number(form.requestedQuantity),
        requestedPrice: Number(form.requestedPrice),
        buyerNote: form.buyerNote
      })
      toast.success('Negotiation request sent! 🤝')
      navigate('/buyer/negotiations')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🤝</div>
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  )

  const totalCost = form.requestedQuantity && form.requestedPrice
    ? (Number(form.requestedQuantity) * Number(form.requestedPrice)).toFixed(0)
    : 0

  const savings = form.requestedQuantity && form.requestedPrice
    ? ((product.pricePerUnit - Number(form.requestedPrice)) * Number(form.requestedQuantity)).toFixed(0)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-8">
        <Link to={`/product/${id}`} className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-800">Request Bulk Deal</h1>
          <p className="text-gray-500 text-sm">Negotiate price directly with the farmer</p>
        </div>
      </div>

      {/* Product info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🌿</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-800">{product.name}</div>
          <div className="text-sm text-gray-500 capitalize">{product.category}</div>
          <div className="text-green-700 font-bold">
            Listed: ₹{product.pricePerUnit}/{product.unit}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{product.quantityAvailable} {product.unit}</div>
          <div>available</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Quantity You Need ({product.unit}) *
          </label>
          <input
            type="number"
            value={form.requestedQuantity}
            onChange={(e) => setForm({ ...form, requestedQuantity: e.target.value })}
            placeholder={`e.g. 100 ${product.unit}`}
            min="1"
            max={product.quantityAvailable}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Max available: {product.quantityAvailable} {product.unit}
          </p>
        </div>

        {/* Requested Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Your Offered Price per {product.unit} (₹) *
          </label>
          <input
            type="number"
            value={form.requestedPrice}
            onChange={(e) => setForm({ ...form, requestedPrice: e.target.value })}
            placeholder={`Less than ₹${product.pricePerUnit}`}
            min="1"
            max={product.pricePerUnit - 1}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Listed price: ₹{product.pricePerUnit}/{product.unit}
          </p>
        </div>

        {/* Note to farmer */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Message to Farmer (optional)
          </label>
          <textarea
            value={form.buyerNote}
            onChange={(e) => setForm({ ...form, buyerNote: e.target.value })}
            placeholder="e.g. I am a restaurant owner and need regular supply. Can we discuss bulk pricing?"
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Deal summary */}
        {totalCost > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-xs font-bold text-green-600 mb-3 uppercase tracking-wide">
              Your Offer Summary
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="font-semibold">{form.requestedQuantity} {product.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Your Price</span>
                <span className="font-semibold">₹{form.requestedPrice}/{product.unit}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Listed Price</span>
                <span className="text-gray-400 line-through">₹{product.pricePerUnit}/{product.unit}</span>
              </div>
              <div className="border-t border-green-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-700">Total Cost</span>
                <span className="font-bold text-green-700 text-lg">₹{totalCost}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-semibold">You Save</span>
                  <span className="text-green-600 font-bold">₹{savings}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {submitting ? '⏳ Sending...' : '🤝 Send Negotiation Request'}
        </button>
      </form>
    </div>
  )
}