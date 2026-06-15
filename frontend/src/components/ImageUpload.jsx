import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { Icon } from './Icons'

export default function ImageUpload({ onUpload, existingImage }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingImage || null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      onUpload(res.data.url)
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
      setPreview(existingImage || null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="label">Product Image</label>

      {preview ? (
        <div className="relative mb-3">
          <img
            src={preview}
            alt="Product preview"
            className="h-48 w-full rounded-xl border border-neutral-200 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Icon name="spinner" className="h-4 w-4 animate-spin" />
                Uploading...
              </div>
            </div>
          )}
          {!uploading && (
            <label className="absolute bottom-2 right-2 cursor-pointer rounded-lg bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow hover:bg-neutral-50">
              Change
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      ) : (
        <label className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition ${
          uploading
            ? 'border-primary-300 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50'
        }`}>
          <Icon name="camera" className="mb-2 h-9 w-9 text-neutral-400" />
          <div className="text-sm font-semibold text-neutral-600">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </div>
          <div className="mt-1 text-xs text-neutral-400">JPG, PNG, WEBP - Max 5MB</div>
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
