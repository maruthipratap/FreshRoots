import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addProduct } from '../services/api'
import ImageUpload from '../components/ImageUpload'

const categories = ['vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products']
const units = ['kg', 'litre', 'pieces', 'dozen', 'gram', 'bunch']

export default function AddProductPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
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

  const handleImageUpload = (url) => {
    setImageUrl(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.category || !form.quantityAvailable || !form.pricePerUnit) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        quantityAvailable: Number(form.quantityAvailable),
        pricePerUnit: Number(form.pricePerUnit),
        images: imageUrl ? [imageUrl] : [],
      }

      await addProduct(payload)
      toast.success('Product added')
      navigate('/farmer/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link to="/farmer/dashboard" className="text-sm font-semibold text-neutral-500 hover:text-primary-700">
          Back
        </Link>
        <h1 className="text-4xl">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <ImageUpload onUpload={handleImageUpload} existingImage={imageUrl} />

        <div>
          <label className="label">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Organic Tomatoes"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Category *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, category: c })}
                className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-semibold capitalize ${
                  form.category === c
                    ? 'border-primary-700 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell buyers about your product..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Quantity *</label>
            <input
              name="quantityAvailable"
              value={form.quantityAvailable}
              onChange={handleChange}
              type="number"
              min="1"
              placeholder="e.g. 50"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Unit *</label>
            <select name="unit" value={form.unit} onChange={handleChange} className="input-field">
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Price per {form.unit} (Rs) *</label>
          <input
            name="pricePerUnit"
            value={form.pricePerUnit}
            onChange={handleChange}
            type="number"
            min="1"
            placeholder="e.g. 40"
            className="input-field"
          />
        </div>

        {form.name && form.pricePerUnit && (
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-primary-700">
              Preview
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="preview" className="mb-3 h-36 w-full rounded-xl object-cover" />
            )}
            <div className="font-semibold text-neutral-800">{form.name}</div>
            <div className="text-sm capitalize text-neutral-500">{form.category || 'Uncategorized'}</div>
            <div className="mt-1 font-bold text-primary-700">
              Rs {form.pricePerUnit}/{form.unit}
            </div>
            <div className="text-sm text-neutral-500">
              {form.quantityAvailable || 0} {form.unit} available
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg">
          {loading ? 'Adding...' : 'Add product'}
        </button>
      </form>
    </main>
  )
}
