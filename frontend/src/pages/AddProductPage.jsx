import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addProduct } from '../services/api'

const categories = ['vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products']
const units = ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch']

export default function AddProductPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    quantityAvailable: '',
    unit: 'kg',
    pricePerUnit: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.quantityAvailable || !form.pricePerUnit) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      await addProduct({
        ...form,
        quantityAvailable: Number(form.quantityAvailable),
        pricePerUnit: Number(form.pricePerUnit)
      })
      toast.success('Product added! 🌱')
      navigate('/farmer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/farmer/dashboard" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-green-800">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Organic Tomatoes"
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
            placeholder="Tell buyers about your product..."
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
              min="1"
              placeholder="e.g. 50"
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
            placeholder="e.g. 40"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Live Preview */}
        {form.name && form.pricePerUnit && (
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
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {loading ? '⏳ Adding...' : '🌱 Add Product'}
        </button>
      </form>
    </div>
  )
}