import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProductById, createGroupBuy } from '../services/api'

export default function CreateGroupBuyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    targetQuantity: '',
    quantityPerPerson: '',
    unlockedPrice: '',
    expiresInDays: '7'
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
    if (!form.title || !form.targetQuantity || !form.quantityPerPerson || !form.unlockedPrice) {
      toast.error('Please fill all required fields')
      return
    }
    if (Number(form.unlockedPrice) >= product.pricePerUnit) {
      toast.error(`Unlocked price must be lower than ₹${product.pricePerUnit}`)
      return
    }
    setSubmitting(true)
    try {
      await createGroupBuy({
        productId: id,
        title: form.title,
        targetQuantity: Number(form.targetQuantity),
        quantityPerPerson: Number(form.quantityPerPerson),
        unlockedPrice: Number(form.unlockedPrice),
        expiresInDays: Number(form.expiresInDays)
      })
      toast.success('Group buy created! Share it with others 👥')
      navigate('/group-buys')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group buy')
    } finally {
      setSubmitting(false)
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

  const totalTarget = form.targetQuantity ? Number(form.targetQuantity) : 0
  const savings = form.unlockedPrice && product
    ? ((product.pricePerUnit - Number(form.unlockedPrice)) * totalTarget).toFixed(0)
    : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-8">
        <Link to={`/product/${id}`} className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-800">Start Group Buy</h1>
          <p className="text-gray-500 text-sm">Pool orders to unlock a better price</p>
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
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Group Buy Title *
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={`e.g. Bulk ${product.name} at ₹25/kg`}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Unlocked Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Unlocked Price per {product.unit} (₹) *
          </label>
          <input
            type="number"
            value={form.unlockedPrice}
            onChange={(e) => setForm({ ...form, unlockedPrice: e.target.value })}
            placeholder={`Less than ₹${product.pricePerUnit}`}
            min="1"
            max={product.pricePerUnit - 1}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Must be lower than listed price ₹{product.pricePerUnit}
          </p>
        </div>

        {/* Target Quantity + Per Person */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Target Quantity ({product.unit}) *
            </label>
            <input
              type="number"
              value={form.targetQuantity}
              onChange={(e) => setForm({ ...form, targetQuantity: e.target.value })}
              placeholder="e.g. 100"
              min="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Per Person ({product.unit}) *
            </label>
            <input
              type="number"
              value={form.quantityPerPerson}
              onChange={(e) => setForm({ ...form, quantityPerPerson: e.target.value })}
              placeholder="e.g. 10"
              min="1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        {/* Expires In */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Expires In *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['3', '5', '7', '14'].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setForm({ ...form, expiresInDays: days })}
                className={`py-2 rounded-xl border-2 text-sm font-semibold transition ${
                  form.expiresInDays === days
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {form.title && form.targetQuantity && form.unlockedPrice && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="text-xs font-bold text-purple-600 mb-3 uppercase tracking-wide">
              Group Buy Preview
            </div>
            <div className="font-bold text-gray-800 text-lg">{form.title}</div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Target</div>
                <div className="font-bold text-gray-700">{form.targetQuantity} {product.unit}</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Per Person</div>
                <div className="font-bold text-gray-700">{form.quantityPerPerson} {product.unit}</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Listed Price</div>
                <div className="font-bold text-gray-400 line-through">₹{product.pricePerUnit}</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400">Unlocked Price</div>
                <div className="font-bold text-purple-600">₹{form.unlockedPrice}</div>
              </div>
            </div>
            {savings > 0 && (
              <div className="mt-3 text-center text-sm text-green-600 font-bold">
                💰 Group saves ₹{savings} total!
              </div>
            )}
            <div className="mt-2 text-center text-xs text-gray-400">
              Expires in {form.expiresInDays} days ·{' '}
              {form.targetQuantity && form.quantityPerPerson
                ? `Need ${Math.ceil(form.targetQuantity / form.quantityPerPerson)} people`
                : ''}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {submitting ? '⏳ Creating...' : '👥 Start Group Buy'}
        </button>
      </form>
    </div>
  )
}