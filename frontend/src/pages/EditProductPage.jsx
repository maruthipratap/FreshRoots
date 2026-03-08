import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProductById, updateProduct, setSeasonalDeal } from '../services/api'

const categories = ['vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products']
const units = ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch']

export default function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingSeasonal, setSavingSeasonal] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    quantityAvailable: '',
    unit: 'kg',
    pricePerUnit: '',
    isActive: true
  })
  const [seasonal, setSeasonal] = useState({
    isSeasonal: false,
    seasonalPrice: '',
    seasonEnd: ''
  })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id)
      const p = res.data
      setForm({
        name: p.name,
        category: p.category,
        description: p.description || '',
        quantityAvailable: p.quantityAvailable,
        unit: p.unit,
        pricePerUnit: p.pricePerUnit,
        isActive: p.isActive
      })
      // Set seasonal state after product loads
      setSeasonal({
        isSeasonal: p.isSeasonal || false,
        seasonalPrice: p.seasonalPrice || '',
        seasonEnd: p.seasonEnd ? new Date(p.seasonEnd).toISOString().split('T')[0] : ''
      })
    } catch {
      toast.error('Product not found')
      navigate('/farmer/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.quantityAvailable || !form.pricePerUnit) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    try {
      await updateProduct(id, {
        ...form,
        quantityAvailable: Number(form.quantityAvailable),
        pricePerUnit: Number(form.pricePerUnit)
      })
      toast.success('Product updated! ✅')
      navigate('/farmer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleSeasonalSave = async () => {
    if (seasonal.isSeasonal && (!seasonal.seasonalPrice || !seasonal.seasonEnd)) {
      toast.error('Enter seasonal price and end date')
      return
    }
    setSavingSeasonal(true)
    try {
      await setSeasonalDeal(id, seasonal)
      toast.success(seasonal.isSeasonal ? '🔥 Seasonal deal set!' : 'Seasonal deal removed')
    } catch {
      toast.error('Failed to update seasonal deal')
    } finally {
      setSavingSeasonal(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">📦</div>
        <div className="text-gray-500">Loading product...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/farmer/dashboard" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-green-800">Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <div className="font-semibold text-gray-700">Product Status</div>
            <div className="text-sm text-gray-500">
              {form.isActive ? 'Visible to buyers' : 'Hidden from buyers'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, isActive: !form.isActive })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              form.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              form.isActive ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, category: c })}
                className={`py-2 px-3 rounded-xl border-2 text-sm font-medium capitalize transition text-left ${
                  form.category === c
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              name="quantityAvailable"
              value={form.quantityAvailable}
              onChange={handleChange}
              type="number"
              min="0"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unit *
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Price per {form.unit} (₹) *
          </label>
          <input
            name="pricePerUnit"
            value={form.pricePerUnit}
            onChange={handleChange}
            type="number"
            min="1"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Live preview */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
            Preview
          </div>
          <div className="font-semibold text-gray-800">{form.name}</div>
          <div className="text-sm text-gray-500 capitalize">{form.category}</div>
          <div className="text-green-700 font-bold mt-1">
            ₹{form.pricePerUnit}/{form.unit}
          </div>
          <div className="text-sm text-gray-500">
            {form.quantityAvailable} {form.unit} available
          </div>
          <div className={`text-xs mt-2 font-semibold ${form.isActive ? 'text-green-600' : 'text-red-500'}`}>
            {form.isActive ? '✅ Visible to buyers' : '🚫 Hidden from buyers'}
          </div>
        </div>

        {/* Seasonal Deal */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-orange-800">🔥 Seasonal Deal</div>
              <div className="text-xs text-orange-600">Offer a limited-time discounted price</div>
            </div>
            <button
              type="button"
              onClick={() => setSeasonal({ ...seasonal, isSeasonal: !seasonal.isSeasonal })}
              className={`w-12 h-6 rounded-full transition-colors ${
                seasonal.isSeasonal ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                seasonal.isSeasonal ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {seasonal.isSeasonal && (
            <>
              <div>
                <label className="block text-sm font-semibold text-orange-700 mb-1">
                  Seasonal Price (₹)
                </label>
                <input
                  type="number"
                  value={seasonal.seasonalPrice}
                  onChange={(e) => setSeasonal({ ...seasonal, seasonalPrice: e.target.value })}
                  placeholder="Discounted price"
                  className="w-full border border-orange-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-orange-700 mb-1">
                  Deal Ends On
                </label>
                <input
                  type="date"
                  value={seasonal.seasonEnd}
                  onChange={(e) => setSeasonal({ ...seasonal, seasonEnd: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-orange-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button
                type="button"
                onClick={handleSeasonalSave}
                disabled={savingSeasonal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl transition"
              >
                {savingSeasonal ? '⏳ Saving...' : '🔥 Save Seasonal Deal'}
              </button>
            </>
          )}

          {!seasonal.isSeasonal && (
            <button
              type="button"
              onClick={handleSeasonalSave}
              disabled={savingSeasonal}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-semibold py-2 rounded-xl transition text-sm"
            >
              {savingSeasonal ? '⏳ Removing...' : 'Remove Seasonal Deal'}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {saving ? '⏳ Saving...' : '✅ Save Changes'}
        </button>
      </form>
    </div>
  )
}