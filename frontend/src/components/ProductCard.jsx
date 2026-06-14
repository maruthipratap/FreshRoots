import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getDistanceKm } from '../utils/distance'
import { useAuth } from '../context/AuthContext'
import { subscribeToProduct, unsubscribeFromProduct } from '../services/api'
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
  const calculateTimeLeft = () => {
    const diff = new Date(endDate) - new Date()
    if (diff <= 0) return null
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)
    return () => clearInterval(timer)
  }, [endDate])

  if (!timeLeft) return <span className="text-xs font-bold text-accent-700">Expired</span>

  return (
    <span className="text-xs font-bold text-accent-700">
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m left
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
        toast.success('Unsubscribed from alerts')
      } else {
        await subscribeToProduct(product._id)
        setSubscribed(true)
        toast.success('You will be notified when this is restocked')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe')
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

  return (
    <article className="card group flex h-full flex-col overflow-hidden hover-lift">
      <div className="relative h-52 overflow-hidden bg-primary-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-50 px-6 text-center font-display text-4xl font-semibold text-primary-700">
            {label}
          </div>
        )}

        {isSeasonalActive && (
          <div className="badge badge-accent absolute left-3 top-3 shadow-sm">
            {discount}% off
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-neutral-800">{product.name}</h3>
            {product.description && (
              <p className="mt-2 text-sm text-neutral-500 text-truncate-2">{product.description}</p>
            )}
          </div>
          <span className="badge badge-primary shrink-0 capitalize">{product.category}</span>
        </div>

        {isSeasonalActive && (
          <div className="mb-3 rounded-xl border border-accent-200 bg-accent-50 px-3 py-2">
            <CountdownTimer endDate={product.seasonEnd} />
          </div>
        )}

        <div className="mb-3 text-sm text-neutral-500">
          {product.quantityAvailable} {product.unit} available
        </div>

        {product.farmerId && (
          <div className="mb-4 space-y-2 border-t border-neutral-100 pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">{product.farmerId.name}</span>
              {product.farmerId.isVerified && <span className="badge badge-primary py-0.5">Verified</span>}
              {distance !== null && <span className="badge badge-neutral py-0.5">{distance} km away</span>}
            </div>
            {product.farmerId.location && (
              <div className="text-xs text-neutral-500">{product.farmerId.location}</div>
            )}
            <Link
              to={`/farm/${product.farmerId._id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex text-xs font-semibold text-primary-700 hover:text-primary-800"
            >
              Farm story
            </Link>
          </div>
        )}

        {user?.role === 'buyer' && product.quantityAvailable <= 5 && (
          <button
            onClick={handleSubscribe}
            className={`mb-3 rounded-xl px-3 py-2 text-xs font-semibold ${
              subscribed
                ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {subscribed ? 'Alerts on' : 'Notify me'}
          </button>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-neutral-100 pt-4">
          <div>
            <div className={`text-2xl font-bold ${isSeasonalActive ? 'text-accent-600' : 'text-primary-700'}`}>
              Rs {displayPrice}
            </div>
            {isSeasonalActive && (
              <div className="text-xs text-neutral-400 line-through">Rs {product.pricePerUnit}</div>
            )}
            <div className="text-xs text-neutral-500">per {product.unit}</div>
          </div>
          <div className="flex min-w-28 flex-col gap-2">
            <Link
              to={`/product/${product._id}`}
              className={`${isSeasonalActive ? 'btn-accent' : 'btn-primary'} px-4 py-2 text-sm`}
            >
              Order
            </Link>
            {user?.role === 'buyer' && (
              <Link
                to={`/product/${product._id}/negotiate`}
                className="rounded-lg bg-primary-50 px-3 py-1.5 text-center text-xs font-semibold text-primary-700 hover:bg-primary-100"
              >
                Negotiate
              </Link>
            )}
            {user?.role === 'buyer' && (
              <Link
                to={`/product/${product._id}/group-buy`}
                className="rounded-lg bg-neutral-100 px-3 py-1.5 text-center text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
              >
                Group buy
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
