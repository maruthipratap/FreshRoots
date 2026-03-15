import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { updateFarmStory, getFarmStory } from '../services/api'
import ImageUpload from '../components/ImageUpload'

export default function FarmStoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    farmName: '',
    bio: '',
    videoUrl: '',
    establishedYear: ''
  })
  const [images, setImages] = useState([]) // array of cloudinary URLs

  useEffect(() => {
    fetchExisting()
  }, [])

  const fetchExisting = async () => {
    try {
      const res = await getFarmStory(user._id)
      const story = res.data.farmStory
      if (story) {
        setForm({
          farmName: story.farmName || '',
          bio: story.bio || '',
          videoUrl: story.videoUrl || '',
          establishedYear: story.establishedYear || ''
        })
        setImages(story.images || [])
      }
    } catch {
      // no story yet, that's fine
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url) => {
    if (images.length >= 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }
    setImages([...images, url])
    toast.success('Photo added! 📸')
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!form.farmName.trim()) {
      toast.error('Farm name is required')
      return
    }
    setSaving(true)
    try {
      await updateFarmStory({
        ...form,
        images,
        establishedYear: form.establishedYear ? Number(form.establishedYear) : null
      })
      toast.success('Farm story saved! 🌾')
      navigate('/farmer/profile')
    } catch {
      toast.error('Failed to save farm story')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🌾</div>
        <div className="text-gray-500">Loading farm story...</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/farmer/profile" className="text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-green-800">Farm Story</h1>
          <p className="text-gray-500 text-sm">Tell buyers about your farm</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Farm Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Farm Name *
          </label>
          <input
            value={form.farmName}
            onChange={(e) => setForm({ ...form, farmName: e.target.value })}
            placeholder="e.g. Green Valley Farm"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Year Established */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Year Established
          </label>
          <input
            type="number"
            value={form.establishedYear}
            onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
            placeholder="e.g. 2005"
            min="1900"
            max={new Date().getFullYear()}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            About Your Farm
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell buyers about your farming methods, what makes your produce special, your story..."
            rows={5}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {form.bio.length}/500
          </div>
        </div>

        {/* Farm Photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Farm Photos ({images.length}/5)
          </label>

          {/* Existing photos */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Farm photo ${i + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload new photo */}
          {images.length < 5 && (
            <ImageUpload
              onUpload={handleImageUpload}
              existingImage={null}
            />
          )}
        </div>

        {/* Video URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Farm Video URL (optional)
          </label>
          <input
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="YouTube or video link of your farm"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Preview */}
        {form.farmName && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">
              Preview
            </div>
            <div className="font-bold text-gray-800 text-lg">{form.farmName}</div>
            {form.establishedYear && (
              <div className="text-sm text-gray-500">
                Est. {form.establishedYear} · {new Date().getFullYear() - form.establishedYear} years of farming
              </div>
            )}
            {form.bio && (
              <div className="text-sm text-gray-600 mt-2 line-clamp-3">{form.bio}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              {images.length} photo{images.length !== 1 ? 's' : ''} added
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
        >
          {saving ? '⏳ Saving...' : '🌾 Save Farm Story'}
        </button>
      </div>
    </div>
  )
}