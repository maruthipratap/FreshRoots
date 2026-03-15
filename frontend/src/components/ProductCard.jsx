import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDistanceKm } from '../utils/distance'
import { useAuth } from '../context/AuthContext'
import { subscribeToProduct, unsubscribeFromProduct } from '../services/api'
import toast from 'react-hot-toast'

const categoryEmoji = {
  'vegetables': '🥦',
  'fruits': '🍎',
  'milk & dairy': '🥛',
  'meat': '🥩',
  'eggs': '🥚',
  'crops': '🌾',
  'farm-made products': '🫙'
}

// Countdown timer component
function CountdownTimer({ endDate }) {
  const calculateTimeLeft = () => {
    const diff = new Date(endDate) - new Date()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60)
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // update every minute
    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return <span className="text-red-500 text-xs font-bold">Expired</span>

  return (
    <span className="text-xs font-bold text-orange-600">
      ⏰ {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m left
    </span>
  )
}

export default function ProductCard({ product, userCoords }) {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(false)
  const emoji = categoryEmoji[product.category] || '🌿'

  // Check if seasonal deal is still active
  const isSeasonalActive = product.isSeasonal &&
    product.seasonalPrice &&
    product.seasonEnd &&
    new Date(product.seasonEnd) > new Date()

  const displayPrice = isSeasonalActive ? product.seasonalPrice : product.pricePerUnit
  const discount = isSeasonalActive
    ? Math.round(((product.pricePerUnit - product.seasonalPrice) / product.pricePerUnit) * 100)
    : 0

  const handleSubscribe = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (subscribed) {
        await unsubscribeFromProduct(product._id)
        setSubscribed(false)
        toast.success('Unsubscribed from alerts')
      } else {
        await subscribeToProduct(product._id)
        setSubscribed(true)
        toast.success('You will be notified when restocked! 🔔')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition hover:-translate-y-1 relative">

      {/* Seasonal Deal Banner */}
      {isSeasonalActive && (
        <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          🔥 {discount}% OFF
        </div>
      )}

      {/* Image or emoji */}
      <div className="w-full h-36 bg-green-50 rounded-xl flex items-center justify-center text-6xl mb-4 overflow-hidden">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          emoji
        )}
      </div>

      <div className="flex-1">
        {/* Name + category */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">
            {product.name}
          </h3>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold ml-2 shrink-0 capitalize">
            {product.category}
          </span>
        </div>

        {/* Seasonal countdown */}
        {isSeasonalActive && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-3">
            <CountdownTimer endDate={product.seasonEnd} />
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Quantity */}
        <div className="text-sm text-gray-500 mb-2">
          📦 {product.quantityAvailable} {product.unit} available
        </div>

        {/* Farmer info + Verified badge */}
        {product.farmerId && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-sm text-gray-500">
              👨‍🌾 {product.farmerId.name}
              {product.farmerId.location && ` · 📍 ${product.farmerId.location}`}
            </span>
            {product.farmerId.isVerified && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                ✅ Verified
              </span>
            )}
            {/* Distance badge */}
            {userCoords && product.farmerId?.coordinates?.lat && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-semibold">
                📍 {getDistanceKm(
                  userCoords.lat, userCoords.lng,
                  product.farmerId.coordinates.lat,
                  product.farmerId.coordinates.lng
                )} km away
              </span>
            )}
            {/* Farm Story button */}
            <Link
              to={`/farm/${product.farmerId._id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold hover:bg-amber-200 transition"
            >
              🌾 Farm Story
            </Link>
          </div>
        )}
      </div>

      {/* Notify Me button for low/out of stock */}
      {user?.role === 'buyer' && product.quantityAvailable <= 5 && (
        <button
          onClick={handleSubscribe}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition mb-2 ${
            subscribed
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {subscribed ? '🔔 Notified' : '🔕 Notify Me'}
        </button>
      )}

      {/* Price + Order button */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          {isSeasonalActive ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-600">₹{displayPrice}</span>
              <span className="text-sm text-gray-400 line-through">₹{product.pricePerUnit}</span>
              <span className="text-gray-500 text-sm">/{product.unit}</span>
            </div>
          ) : (
            <div>
              <span className="text-2xl font-bold text-green-700">₹{product.pricePerUnit}</span>
              <span className="text-gray-500 text-sm">/{product.unit}</span>
            </div>
          )}
        </div>
        <Link
          to={`/product/${product._id}`}
          className={`text-white text-sm font-semibold px-4 py-2 rounded-xl transition ${
            isSeasonalActive
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-green-700 hover:bg-green-800'
          }`}
        >
          Order Now
        </Link>
      </div>
    </div>
  )
}