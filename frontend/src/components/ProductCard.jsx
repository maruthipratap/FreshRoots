import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { getDistanceKm } from '../utils/distance'
import { useAuth } from '../context/AuthContext'
import { subscribeToProduct, unsubscribeFromProduct } from '../services/api'
import { Sprout, MapPin, Bell, ShieldCheck, Tag, ShoppingBag, Users, Handshake } from 'lucide-react'
import toast from 'react-hot-toast'

const categoryLabel = {
  vegetables: 'Veg',
  fruits: 'Fruit',
  'milk & dairy': 'Dairy',
  meat: 'Meat',
  eggs: 'Eggs',
  crops: 'Crop',
  'farm-made products': 'Farm Made',
}

function CountdownTimer({ endDate }) {
  const calculateTimeLeft = useCallback(() => {
    const diff = new Date(endDate) - new Date()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
    }
  }, [endDate])

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  if (!timeLeft) return <span className="text-xs font-bold text-accent-700">Deal Expired</span>

  return (
    <span className="text-xs font-semibold text-accent-700">
      Ends in: {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
    </span>
  )
}

export default function ProductCard({ product, userCoords }) {
  const { user } = useAuth()
  const [subscribed, setSubscribed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const label = categoryLabel[product.category] || 'Fresh'

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
        toast.success('Unsubscribed from restock alerts')
      } else {
        await subscribeToProduct(product._id)
        setSubscribed(true)
        toast.success('Restock notification alert enabled!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update alert settings')
    }
  }

  const distance = userCoords && product.farmerId?.coordinates?.lat
    ? getDistanceKm(
      userCoords.lat,
      userCoords.lng,
      product.farmerId.coordinates.lat,
      product.farmerId.coordinates.lng
    )
    : null

  const stockPercentage = Math.min(100, Math.max(10, (product.quantityAvailable / 50) * 100))

  return (
    <article className="card group flex h-full flex-col overflow-hidden hover-lift border border-neutral-200/80 bg-white rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100/50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-primary-800">
            <Sprout className="h-10 w-10 text-primary-600 animate-pulse" />
            <span className="font-display text-lg font-semibold">{label}</span>
          </div>
        )}

        {isSeasonalActive && (
          <div className="badge bg-accent-500 text-white font-bold text-xs px-3 py-1 shadow-md absolute left-3 top-3 flex items-center gap-1 rounded-full">
            <Tag className="h-3.5 w-3.5" />
            {discount}% OFF
          </div>
        )}

        <div className="absolute right-3 top-3">
          <span className="badge bg-white/90 text-primary-800 text-xs font-semibold px-3 py-1 backdrop-blur-md border border-neutral-200/60 shadow-sm capitalize rounded-full">
            {product.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <h3 className="text-xl font-bold leading-tight text-neutral-800 group-hover:text-primary-700 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{product.description}</p>
          )}
        </div>

        {isSeasonalActive && (
          <div className="mb-3 rounded-xl border border-accent-200/70 bg-accent-50/80 px-3 py-2 flex items-center gap-2">
            <CountdownTimer endDate={product.seasonEnd} />
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
            <span>Availability</span>
            <span className="font-semibold text-neutral-700">{product.quantityAvailable} {product.unit} left</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                product.quantityAvailable <= 5 ? 'bg-accent-500' : 'bg-primary-500'
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>

        {product.farmerId && (
          <div className="mb-4 space-y-1.5 border-t border-neutral-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-neutral-800">{product.farmerId.name}</span>
                {product.farmerId.isVerified && (
                  <ShieldCheck className="h-4 w-4 text-primary-600" title="Verified Farmer" />
                )}
              </div>
              <Link
                to={`/farm/${product.farmerId._id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-semibold text-primary-700 hover:underline inline-flex items-center gap-1"
              >
                Story
              </Link>
            </div>

            {product.farmerId.location && (
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{product.farmerId.location}</span>
                {distance !== null && <span className="text-primary-700 font-medium">({distance} km)</span>}
              </div>
            )}
          </div>
        )}

        {user?.role === 'buyer' && product.quantityAvailable <= 5 && (
          <button
            onClick={handleSubscribe}
            className={`mb-4 w-full flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              subscribed
                ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            {subscribed ? 'Alert Enabled' : 'Notify when restocked'}
          </button>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <div>
            <div className={`text-2xl font-extrabold ${isSeasonalActive ? 'text-accent-600' : 'text-primary-700'}`}>
              ₹{displayPrice}
            </div>
            {isSeasonalActive && (
              <div className="text-xs text-neutral-400 line-through">₹{product.pricePerUnit}</div>
            )}
            <div className="text-xs font-medium text-neutral-500">per {product.unit}</div>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <Link
              to={`/product/${product._id}`}
              className={`${
                isSeasonalActive ? 'btn-accent' : 'btn-primary'
              } px-4 py-2 text-sm text-center flex items-center justify-center gap-1.5 shadow-sm hover:shadow`}
            >
              <ShoppingBag className="h-4 w-4" />
              Order
            </Link>
            {user?.role === 'buyer' && (
              <div className="flex gap-1">
                <Link
                  to={`/product/${product._id}/negotiate`}
                  className="flex-1 rounded-lg bg-primary-50 px-2 py-1.5 text-center text-xs font-semibold text-primary-700 hover:bg-primary-100 flex items-center justify-center gap-1"
                  title="Negotiate Price"
                >
                  <Handshake className="h-3 w-3" />
                  Deal
                </Link>
                <Link
                  to={`/product/${product._id}/group-buy`}
                  className="flex-1 rounded-lg bg-neutral-100 px-2 py-1.5 text-center text-xs font-semibold text-neutral-700 hover:bg-neutral-200 flex items-center justify-center gap-1"
                  title="Start Group Buy"
                >
                  <Users className="h-3 w-3" />
                  Group
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
