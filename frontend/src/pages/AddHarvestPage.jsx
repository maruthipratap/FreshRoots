import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createHarvest } from '../services/api'

const categories = ['vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products']
const units = ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch']

export default function AddHarvestPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    productName: '',
    category: '',
    description: '',
    estimatedQuantity: '',
    unit: 'kg',
    pricePerUnit: '',
    expectedHarvestDate: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.productName || !form.category || !form.estimatedQuantity || !form.pricePerUnit || !form.expectedHarvestDate) {
      toast.error('Please fill all required fields')
      return
    }
    // Check date is in future
    if (new Date(form.expectedHarvestDate) <= new Date()) {
      toast.error('Harvest date must be in the future')
      return
    }
    setLoading(true)
    try {
      await createHarvest({
        ...form,
        estimatedQuantity: Number(form.estimatedQuantity),
        pricePerUnit: Number(form.pricePerUnit)
      })
      toast.success('Harvest listing created! 🌱')
      navigate('/farmer/harvests')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create harvest')
    } finally {
      setLoading(false)
    }
  }

  // Min date = tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-8">
        <Link to="/farmer/harvests" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-800">Post Harvest</h1>
          <p className="text-gray-500 text-sm">Let buyers pre-book before you harvest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="e.g. Fresh Tomatoes"
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
            placeholder="Tell buyers about this upcoming harvest..."
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Expected Harvest Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Expected Harvest Date *
          </label>
          <input
            name="expectedHarvestDate"
            value={form.expectedHarvestDate}
            onChange={handleChange}
            type="date"
            min={minDate}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Quantity + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Estimated Quantity *
            </label>
            <input
              name="estimatedQuantity"
              value={form.estimatedQuantity}
              onChange={handleChange}
              type="number"
              min="1"
              placeholder="e.g. 500"
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
            Pre-booking Price per {form.unit} (₹) *
          </label>
          <input
            name="pricePerUnit"
            value={form.pricePerUnit}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="e.g. 35"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Preview */}
        {form.productName && form.expectedHarvestDate && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
              Preview
            </div>
            <div className="font-bold text-gray-800">{form.productName}</div>
            <div className="text-sm text-gray-500 capitalize">{form.category}</div>
            <div className="text-green-700 font-bold mt-1">
              ₹{form.pricePerUnit}/{form.unit}
            </div>
            <div className="text-sm text-gray-500">
              🌱 {form.estimatedQuantity} {form.unit} expected
            </div>
            <div className="text-sm text-blue-600 font-semibold mt-1">
              📅 Harvest: {new Date(form.expectedHarvestDate).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {loading ? '⏳ Posting...' : '📅 Post Harvest Listing'}
        </button>
      </form>
    </div>
  )
}