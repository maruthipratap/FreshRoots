import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

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

  // Fetch when category changes
  useEffect(() => {
    fetchProducts()
  }, [category])

  // Apply filters locally whenever search/sort/price changes
  useEffect(() => {
    applyFilters()
  }, [products, search, sortBy, maxPrice])

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

  const applyFilters = () => {
    let result = [...products]

    // Search filter
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.farmerId?.name?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Max price filter
    if (maxPrice) {
      result = result.filter(p => p.pricePerUnit <= Number(maxPrice))
    }

    // Sort
    if (sortBy === 'newest') {
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
  }

  const hasActiveFilters = search || maxPrice || sortBy !== 'newest' || category !== 'all'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Browse Products</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Loading...' : `${filtered.length} products found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold text-sm transition ${
            showFilters
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          🔧 Filters {hasActiveFilters && <span className="bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
        </button>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, description or farmer..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-3 text-sm text-red-500 hover:text-red-700 font-semibold border-2 border-red-200 rounded-xl hover:bg-red-50 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="quantity">Most Available</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price (₹)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 100"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition border-2 ${
              category === c
                ? 'bg-green-700 text-white border-green-700'
                : 'border-gray-200 text-gray-500 hover:border-green-300 bg-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="w-full h-36 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-gray-200 rounded mb-4 w-1/2" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try different filters or search terms</p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}