import { Link } from 'react-router-dom'

const categoryEmoji = {
  'vegetables': '🥦',
  'fruits': '🍎',
  'milk & dairy': '🥛',
  'meat': '🥩',
  'eggs': '🥚',
  'crops': '🌾',
  'farm-made products': '🫙'
}

export default function ProductCard({ product }) {
  const emoji = categoryEmoji[product.category] || '🌿'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition hover:-translate-y-1">

      {/* Emoji placeholder */}
      <div className="w-full h-36 bg-green-50 rounded-xl flex items-center justify-center text-6xl mb-4">
        {emoji}
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

        {/* Farmer info */}
        {product.farmerId && (
          <div className="text-sm text-gray-500 mb-4">
            👨‍🌾 {product.farmerId.name}
            {product.farmerId.location && ` · 📍 ${product.farmerId.location}`}
          </div>
        )}
      </div>

      {/* Price + Order button */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-2xl font-bold text-green-700">₹{product.pricePerUnit}</span>
          <span className="text-gray-500 text-sm">/{product.unit}</span>
        </div>
        <Link
          to={`/product/${product._id}`}
          className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          Order Now
        </Link>
      </div>
    </div>
  )
}