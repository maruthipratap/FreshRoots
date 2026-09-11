import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, geocodeLocation } from '../services/api'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/SkeletonLoader'
import { getDistanceKm } from '../utils/distance'
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react'

const categories = ['all', 'vegetables', 'fruits', 'milk & dairy', 'meat', 'eggs', 'crops', 'farm-made products']

export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [locationInput, setLocationInput] = useState('')
  const [userCoords, setUserCoords] = useState(null)
  const [locating, setLocating] = useState(false)
  const [nearbyOnly, setNearbyOnly] = useState(false)
  const [nearbyRadius, setNearbyRadius] = useState(100)

  useEffect(() => {
    fetchProducts()
  }, [category])

  useEffect(() => {
    applyFilters()
  }, [products, search, sortBy, maxPrice, userCoords, nearbyOnly, nearbyRadius])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (category !== 'all') params.category = category
      const res = await getProducts(params)
      setProducts(res.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearbyOnly(true)
        setLocating(false)
      },
      () => {
        alert('Could not detect location. Try entering your city manually.')
        setLocating(false)
      }
    )
  }

  const handleSearchLocation = async () => {
    if (!locationInput.trim()) return
    setLocating(true)
    try {
      const results = await geocodeLocation(locationInput)
      if (results && results.length > 0) {
        setUserCoords({
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
        })
        setNearbyOnly(true)
      } else {
        alert('Location not found. Try a different city name.')
      }
    } catch {
      alert('Failed to find location')
    } finally {
      setLocating(false)
    }
  }

  const applyFilters = () => {
    let result = [...products]

    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.farmerId?.name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (maxPrice) {
      result = result.filter(p => p.pricePerUnit <= Number(maxPrice))
    }

    if (nearbyOnly && userCoords) {
      result = result.filter(p => {
        const coords = p.farmerId?.coordinates
        if (!coords?.lat || !coords?.lng) return true
        const dist = getDistanceKm(userCoords.lat, userCoords.lng, coords.lat, coords.lng)
        return dist <= nearbyRadius
      })
    }

    if (sortBy === 'nearest' && userCoords) {
      result.sort((a, b) => {
        const aCoords = a.farmerId?.coordinates
        const bCoords = b.farmerId?.coordinates
        if (!aCoords?.lat) return 1
        if (!bCoords?.lat) return -1
        const aDist = getDistanceKm(userCoords.lat, userCoords.lng, aCoords.lat, aCoords.lng)
        const bDist = getDistanceKm(userCoords.lat, userCoords.lng, bCoords.lat, bCoords.lng)
        return aDist - bDist
      })
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.pricePerUnit - b.pricePerUnit)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.pricePerUnit - a.pricePerUnit)
    } else if (sortBy === 'quantity') {
      result.sort((a, b) => b.quantityAvailable - a.quantityAvailable)
    }

    setFiltered(result)
  }

  const handleClearFilters = () => {
    setSearch('')
    setMaxPrice('')
    setSortBy('newest')
    setCategory('all')
    setNearbyOnly(false)
    setUserCoords(null)
    setLocationInput('')
  }

  const hasActiveFilters = search || maxPrice || sortBy !== 'newest' || category !== 'all' || nearbyOnly

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Title & Filter Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 font-display flex items-center gap-2.5">
            <ShoppingBag className="h-8 w-8 text-primary-700" />
            Direct Farm Marketplace
          </h1>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            {loading ? 'Fetching fresh produce...' : `${filtered.length} products available near you`}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-outline px-4 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-sm ${
            showFilters ? 'border-primary-700 bg-primary-50 text-primary-700' : ''
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-accent-500 animate-ping" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search produce, farmer name, or farm location..."
            className="input-field pl-12 pr-10 py-3 text-base shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="btn-outline border-accent-200/80 px-4 py-3 text-sm font-semibold text-accent-600 hover:bg-accent-50 flex items-center gap-1.5 justify-center"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Filter Drawer Card */}
      {showFilters && (
        <div className="card mb-8 space-y-6 p-6 border border-neutral-200/80 bg-white shadow-md rounded-2xl reveal-up">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5">
                <ArrowUpDown className="h-4 w-4 text-primary-600" />
                Sort Products By
              </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field py-2.5">
                <option value="newest">Newest Listed</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="quantity">Highest Quantity Available</option>
                {userCoords && <option value="nearest">Nearest Farm Distance</option>}
              </select>
            </div>

            <div>
              <label className="label">Max Price Limit (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 150"
                className="input-field py-2.5"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-5">
            <label className="label flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-accent-500" />
              Filter By Farm Location & Distance
            </label>
            <div className="mb-4 flex flex-wrap gap-2.5">
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                placeholder="Enter city or district name (e.g. Pune)"
                className="input-field min-w-[240px] flex-1 py-2 text-sm"
              />
              <button onClick={handleSearchLocation} disabled={locating} className="btn-primary px-5 py-2 text-sm">
                {locating ? 'Searching...' : 'Search Location'}
              </button>
              <button onClick={handleDetectLocation} disabled={locating} className="btn-outline px-4 py-2 text-sm">
                {locating ? 'Detecting...' : 'Detect GPS'}
              </button>
            </div>

            {userCoords && (
              <div className="flex flex-wrap items-center gap-4 bg-primary-50/70 p-3.5 rounded-xl border border-primary-200/50">
                <span className="badge badge-primary font-bold">GPS Location Set</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                  Radius: {nearbyRadius} km
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={nearbyRadius}
                    onChange={(e) => setNearbyRadius(Number(e.target.value))}
                    className="w-32 accent-primary-700"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={nearbyOnly}
                    onChange={(e) => setNearbyOnly(e.target.checked)}
                    className="rounded accent-primary-700 h-4 w-4"
                  />
                  Nearby Farms Only
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition-all ${
              category === c
                ? 'bg-primary-700 text-white shadow-sm'
                : 'border border-neutral-200/80 bg-white text-neutral-600 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid / Skeletons */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-3xl p-16 text-center max-w-lg mx-auto my-12 border border-neutral-200/80 bg-white shadow-sm">
          <Sparkles className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-800 font-display">No Produce Found</h3>
          <p className="mt-2 text-sm text-neutral-500">
            We couldn't find any products matching your current search or category filter.
          </p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="btn-primary mt-6 text-sm py-2.5 px-6">
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} userCoords={userCoords} />
          ))}
        </div>
      )}
    </main>
  )
}
