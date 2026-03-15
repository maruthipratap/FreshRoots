import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFarmStory, getProducts } from '../services/api'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'

export default function FarmStoryViewPage() {
  const { farmerId } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    fetchData()
  }, [farmerId])

  const fetchData = async () => {
    try {
      const [farmerRes, productsRes] = await Promise.all([
        getFarmStory(farmerId),
        getProducts({})
      ])
      setFarmer(farmerRes.data)
      const farmerProducts = productsRes.data.filter(
        p => p.farmerId?._id === farmerId || p.farmerId === farmerId
      )
      setProducts(farmerProducts)
    } catch {
      toast.error('Failed to load farm story')
    } finally {
      setLoading(false)
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

  if (!farmer) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">😕</div>
      <div className="text-gray-500">Farm not found</div>
      <Link to="/browse" className="text-green-600 mt-4 block">← Back to Browse</Link>
    </div>
  )

  const story = farmer.farmStory
  const hasStory = story && (story.farmName || story.bio || story.images?.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back button */}
      <Link to="/browse" className="text-gray-400 hover:text-gray-600 mb-6 block">
        ← Back to Browse
      </Link>

      {/* Farm Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">

        {/* Cover photo */}
        {story?.images?.length > 0 ? (
          <div className="relative">
            <img
              src={story.images[activePhoto]}
              alt="Farm"
              className="w-full h-64 object-cover"
            />
            {story.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                {story.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      activePhoto === i ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
            <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {activePhoto + 1}/{story.images.length}
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-green-100 flex items-center justify-center text-7xl">
            🌾
          </div>
        )}

        <div className="p-6">

          {/* Farm name + badges */}
          <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {hasStory && story.farmName ? story.farmName : `${farmer.name}'s Farm`}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-gray-500 text-sm">
                  📍 {farmer.location || 'Location not set'}
                </span>
                {story?.establishedYear && (
                  <span className="text-gray-400 text-sm">
                    · Est. {story.establishedYear} ({new Date().getFullYear() - story.establishedYear} years)
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {farmer.isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-semibold">
                  ✅ Verified Farmer
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                Member since {new Date(farmer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Farmer name */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-2xl">
              👨‍🌾
            </div>
            <div>
              <div className="font-semibold text-gray-800">{farmer.name}</div>
              <div className="text-sm text-gray-500">Farmer · {farmer.location}</div>
            </div>
          </div>

          {/* Bio */}
          {story?.bio ? (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">About the Farm</h3>
              <p className="text-gray-600 leading-relaxed">{story.bio}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">
              This farmer hasn't added a farm story yet.
            </p>
          )}

            {/* Video */}
            {story?.videoUrl && (
                <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Farm Video</h3>
                <a
                    href={story.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition font-semibold text-sm"
                >
                    ▶️ Watch Farm Video
                </a>
                </div>
          )}
          {/* Photo grid */}
          {story?.images?.length > 1 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Farm Photos</h3>
              <div className="grid grid-cols-3 gap-2">
                {story.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Farm ${i + 1}`}
                    onClick={() => setActivePhoto(i)}
                    className={`w-full h-24 object-cover rounded-xl cursor-pointer transition ${
                      activePhoto === i ? 'ring-2 ring-green-500' : 'hover:opacity-90'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Products from this farmer */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Products from this Farm ({products.length})
        </h2>
        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <p>No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}