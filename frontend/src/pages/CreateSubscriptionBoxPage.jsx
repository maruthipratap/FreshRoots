import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createSubscriptionBox } from '../services/api'

const units = ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch']

export default function CreateSubscriptionBoxPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    boxName: '',
    description: '',
    price: '',
    frequency: 'weekly'
  })
  const [items, setItems] = useState([
    { name: '', quantity: '', unit: 'kg' }
  ])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const addItem = () => {
    if (items.length >= 10) {
      toast.error('Maximum 10 items per box')
      return
    }
    setItems([...items, { name: '', quantity: '', unit: 'kg' }])
  }

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error('At least 1 item required')
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.boxName || !form.price || !form.frequency) {
      toast.error('Please fill all required fields')
      return
    }
    const validItems = items.filter(i => i.name && i.quantity)
    if (validItems.length === 0) {
      toast.error('Add at least 1 item to the box')
      return
    }
    setLoading(true)
    try {
      await createSubscriptionBox({
        ...form,
        price: Number(form.price),
        items: validItems.map(i => ({
          name: i.name,
          quantity: Number(i.quantity),
          unit: i.unit
        }))
      })
      toast.success('Subscription box created! 📦')
      navigate('/farmer/subscription-boxes')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create box')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="flex items-center gap-3 mb-8">
        <Link to="/farmer/subscription-boxes" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-800">Create Subscription Box</h1>
          <p className="text-gray-500 text-sm">Offer recurring farm boxes to buyers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Box Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Box Name *
          </label>
          <input
            name="boxName"
            value={form.boxName}
            onChange={handleChange}
            placeholder="e.g. Weekly Veggie Box"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
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
            placeholder="Tell buyers what's in this box and why they'll love it..."
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Delivery Frequency *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['weekly', 'biweekly', 'monthly'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForm({ ...form, frequency: f })}
                className={`py-3 rounded-xl border-2 text-sm font-semibold capitalize transition ${
                  form.frequency === f
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f === 'weekly' ? '📅 Weekly' :
                 f === 'biweekly' ? '📅 Bi-weekly' : '📅 Monthly'}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Box Price (₹) *
          </label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="e.g. 499"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <p className="text-xs text-gray-400 mt-1">
            Price per {form.frequency === 'weekly' ? 'week' : form.frequency === 'biweekly' ? '2 weeks' : 'month'}
          </p>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Box Contents * ({items.length} items)
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg font-semibold transition"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="Item name"
                  className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                <input
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  type="number"
                  min="1"
                  placeholder="Qty"
                  className="w-16 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                />
                <select
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  className="w-20 border border-gray-300 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {form.boxName && form.price && items[0].name && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-xs font-bold text-green-600 mb-2 uppercase">Preview</div>
            <div className="font-bold text-gray-800 text-lg">{form.boxName}</div>
            <div className="text-green-700 font-bold">₹{form.price}/{form.frequency === 'weekly' ? 'week' : form.frequency === 'biweekly' ? '2 weeks' : 'month'}</div>
            {form.description && <p className="text-sm text-gray-500 mt-1">{form.description}</p>}
            <div className="mt-2 space-y-1">
              {items.filter(i => i.name).map((item, i) => (
                <div key={i} className="text-sm text-gray-600">
                  • {item.name} — {item.quantity} {item.unit}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {loading ? '⏳ Creating...' : '📦 Create Subscription Box'}
        </button>
      </form>
    </div>
  )
}
