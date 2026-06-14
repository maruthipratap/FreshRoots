import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, geocodeLocation } from '../services/api'
import ProductCard from '../components/ProductCard'
import { getDistanceKm } from '../utils/distance'

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">Browse Products</h1>
          <p className="mt-1 text-neutral-500">
            {loading ? 'Loading...' : `${filtered.length} products found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-outline px-4 py-2 text-sm ${
            showFilters ? 'border-primary-700 bg-primary-50 text-primary-700' : ''
          }`}
        >
          Filters
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-accent-500" />}
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, description, or farmer..."
          className="input-field flex-1"
        />
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="btn-outline border-accent-200 px-4 py-3 text-sm text-accent-600 hover:bg-accent-50"
          >
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card mb-6 space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="quantity">Most Available</option>
                {userCoords && <option value="nearest">Nearest First</option>}
              </select>
            </div>

            <div>
              <label className="label">Max Price (Rs)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 100"
                className="input-field"
              />
            </div>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <label className="label">Filter by location</label>
            <div className="mb-3 flex flex-wrap gap-2">
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation()}
                placeholder="Enter your city, e.g. Hyderabad"
                className="input-field min-w-60 flex-1 py-2 text-sm"
              />
              <button onClick={handleSearchLocation} disabled={locating} className="btn-primary px-4 py-2 text-sm">
                {locating ? 'Searching...' : 'Search'}
              </button>
              <button onClick={handleDetectLocation} disabled={locating} className="btn-outline px-4 py-2 text-sm">
                {locating ? 'Detecting...' : 'Detect'}
              </button>
            </div>

            {userCoords && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="badge badge-primary">Location set</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                  Radius: {nearbyRadius} km
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={nearbyRadius}
                    onChange={(e) => setNearbyRadius(Number(e.target.value))}
                    className="w-28 accent-primary-700"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-neutral-600">
                  <input
                    type="checkbox"
                    checked={nearbyOnly}
                    onChange={(e) => setNearbyOnly(e.target.checked)}
                    className="rounded accent-primary-700"
                  />
                  Nearby only
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize ${
              category === c
                ? 'border-primary-700 bg-primary-700 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            {c}
          </button>
        ))}
        {userCoords && (
          <button
            onClick={() => setNearbyOnly(!nearbyOnly)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              nearbyOnly
                ? 'border-accent-500 bg-accent-500 text-white'
                : 'border-neutral-200 bg-white text-neutral-600 hover:border-accent-300 hover:bg-accent-50'
            }`}
          >
            Near me
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5">
              <div className="mb-4 h-40 animate-pulse rounded-xl bg-neutral-200" />
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
              <div className="mb-4 h-3 w-1/2 animate-pulse rounded bg-neutral-200" />
              <div className="h-8 animate-pulse rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-lg font-semibold text-neutral-700">No products found</p>
          <p className="mt-1 text-sm text-neutral-500">Try different filters or search terms.</p>
          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="btn-primary mt-5">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} userCoords={userCoords} />
          ))}
        </div>
      )}
    </main>
  )
}
