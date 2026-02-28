import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

export default function ImageUpload({ onUpload, existingImage }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingImage || null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    // Upload to Cloudinary via backend
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onUpload(res.data.url)
      toast.success('Image uploaded! ✅')
    } catch {
      toast.error('Failed to upload image')
      setPreview(existingImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Product Image
      </label>

      {/* Preview */}
      {preview ? (
        <div className="relative mb-3">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-xl border border-gray-200"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
              <div className="text-white font-semibold">⏳ Uploading...</div>
            </div>
          )}
          {!uploading && (
            <label className="absolute bottom-2 right-2 bg-white text-gray-700 text-xs font-semibold px-3 py-1 rounded-lg cursor-pointer hover:bg-gray-50 shadow">
              Change
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition ${
          uploading
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
        }`}>
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm font-semibold text-gray-600">
            {uploading ? '⏳ Uploading...' : 'Click to upload image'}
          </div>
          <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5MB</div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}