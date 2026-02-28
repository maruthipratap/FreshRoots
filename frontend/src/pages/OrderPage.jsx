import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getProductById, placeOrder, updatePaymentStatus } from '../services/api'

export default function OrderPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [step, setStep] = useState('order') // order → payment → success
  const [placedOrder, setPlacedOrder] = useState(null)
  const [form, setForm] = useState({
    quantity: 1,
    deliveryType: 'pickup',
    deliveryAddress: '',
    notes: ''
  })

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await getProductById(id)
      setProduct(res.data)
    } catch {
      toast.error('Product not found')
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (form.quantity < 1 || form.quantity > product.quantityAvailable) {
      toast.error(`Quantity must be between 1 and ${product.quantityAvailable}`)
      return
    }
    if (form.deliveryType === 'delivery' && !form.deliveryAddress) {
      toast.error('Enter delivery address')
      return
    }
    setPlacing(true)
    try {
      const res = await placeOrder({
        productId: product._id,
        quantityOrdered: Number(form.quantity),
        deliveryType: form.deliveryType,
        deliveryAddress: form.deliveryAddress,
        notes: form.notes
      })
      setPlacedOrder(res.data)
      setStep('payment')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const handleMockPayment = async () => {
    setPlacing(true)
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 1500))
    try {
      await updatePaymentStatus(placedOrder._id)
      setStep('success')
      toast.success('Payment successful! 🎉')
    } catch {
      toast.error('Payment failed')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-5xl mb-4">🛒</div>
        <div className="text-gray-500">Loading product...</div>
      </div>
    </div>
  )

  const total = product ? product.pricePerUnit * form.quantity : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* SUCCESS */}
      {step === 'success' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">
            Your order for <strong>{product.name}</strong> is confirmed.
            The farmer will be in touch soon.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-left mb-6 space-y-2 text-sm text-gray-700">
            <div>📦 Product: <strong>{product.name}</strong></div>
            <div>🔢 Quantity: <strong>{form.quantity} {product.unit}</strong></div>
            <div>💰 Total Paid: <strong>₹{total}</strong></div>
            <div>🚚 Delivery: <strong className="capitalize">{form.deliveryType}</strong></div>
            <div>✅ Payment: <strong className="text-green-600">Paid</strong></div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="border-2 border-green-700 text-green-700 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition"
            >
              Browse More
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT */}
      {step === 'payment' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h1>

          {/* Order summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500 font-semibold mb-3">Order Summary</div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>{product.name}</span>
                <span>₹{product.pricePerUnit} × {form.quantity}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span className="text-green-700">₹{total}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
            ⚠️ This is a <strong>mock payment</strong> for demo. No real money charged.
          </div>

          <button
            onClick={handleMockPayment}
            disabled={placing}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
          >
            {placing ? '⏳ Processing...' : `💳 Pay ₹${total}`}
          </button>
        </div>
      )}

      {/* ORDER FORM */}
      {step === 'order' && (
        <>
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-green-800">Place Order</h1>
          </div>

          {/* Product info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                🥬
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800 text-lg">{product.name}</h2>
                <p className="text-gray-500 text-sm capitalize">{product.category}</p>
                <p className="text-green-700 font-bold text-lg mt-1">
                  ₹{product.pricePerUnit}/{product.unit}
                </p>
                <p className="text-gray-500 text-sm">
                  {product.quantityAvailable} {product.unit} available
                </p>
                {product.farmerId && (
                  <p className="text-gray-500 text-sm mt-1">
                    👨‍🌾 {product.farmerId.name} · 📍 {product.farmerId.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Quantity ({product.unit})
              </label>
              <input
                type="number"
                min={1}
                max={product.quantityAvailable}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Max: {product.quantityAvailable} {product.unit}
              </p>
            </div>

            {/* Delivery type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Delivery Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['pickup', 'delivery'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setForm({ ...form, deliveryType: d })}
                    className={`py-3 rounded-xl border-2 font-semibold capitalize transition ${
                      form.deliveryType === d
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    {d === 'pickup' ? '🏪' : '🚚'} {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            {form.deliveryType === 'delivery' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Enter your full delivery address"
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notes for Farmer (optional)
              </label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special requests..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Total */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-green-700">₹{total}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {form.quantity} {product.unit} × ₹{product.pricePerUnit}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-4 rounded-xl transition text-lg"
            >
              {placing ? '⏳ Placing order...' : '🛒 Place Order'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}