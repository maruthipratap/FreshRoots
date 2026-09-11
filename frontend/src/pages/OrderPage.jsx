import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react'
import toast from 'react-hot-toast'
import { getProductById, placeOrder, updatePaymentStatus } from '../services/api'
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  Sprout,
  Plus,
  Minus,
  MapPin,
  User,
  ShieldCheck
} from 'lucide-react'

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
    const numQty = Number(form.quantity)
    if (isNaN(numQty) || numQty < 1 || numQty > product.quantityAvailable) {
      toast.error(`Quantity must be between 1 and ${product.quantityAvailable}`)
      return
    }
    if (form.deliveryType === 'delivery' && !form.deliveryAddress.trim()) {
      toast.error('Please enter a delivery address')
      return
    }
    setPlacing(true)
    try {
      const res = await placeOrder({
        productId: product._id,
        quantityOrdered: numQty,
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
    await new Promise(r => setTimeout(r, 1200))
    try {
      await updatePaymentStatus(placedOrder._id)
      setStep('success')
      toast.success('Payment successful! 🎉')
    } catch {
      toast.error('Payment processing failed')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Sprout className="h-10 w-10 text-primary-600 animate-spin" />
      <div className="text-sm font-semibold text-neutral-600">Loading product details...</div>
    </div>
  )

  const isSeasonalActive = product &&
    product.isSeasonal &&
    product.seasonalPrice &&
    product.seasonEnd &&
    new Date(product.seasonEnd) > new Date()

  const priceToUse = isSeasonalActive ? product.seasonalPrice : product.pricePerUnit
  const total = product ? priceToUse * form.quantity : 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* SUCCESS STEP */}
      {step === 'success' && (
        <div className="card rounded-3xl p-10 text-center border border-neutral-200 bg-white shadow-lg reveal-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 font-display mb-2">Order Confirmed!</h1>
          <p className="text-neutral-600 text-sm mb-6 max-w-md mx-auto">
            Your order for <strong className="text-neutral-900">{product.name}</strong> has been successfully placed with the farmer.
          </p>

          <div className="bg-primary-50/70 border border-primary-200/60 rounded-2xl p-5 text-left mb-8 space-y-2.5 text-sm text-neutral-700">
            <div className="flex justify-between"><span>Product:</span> <strong className="text-neutral-900">{product.name}</strong></div>
            <div className="flex justify-between"><span>Quantity:</span> <strong className="text-neutral-900">{form.quantity} {product.unit}</strong></div>
            <div className="flex justify-between"><span>Total Paid:</span> <strong className="text-primary-700 text-base">₹{total}</strong></div>
            <div className="flex justify-between"><span>Delivery Mode:</span> <strong className="capitalize text-neutral-900">{form.deliveryType}</strong></div>
            <div className="flex justify-between"><span>Status:</span> <strong className="text-primary-600">Paid & Pending Acceptance</strong></div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary px-6 py-3 text-sm font-semibold shadow-sm"
            >
              Track Order Status
            </button>
            <button
              onClick={() => navigate('/browse')}
              className="btn-outline px-6 py-3 text-sm font-semibold"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT STEP */}
      {step === 'payment' && (
        <div className="card rounded-3xl p-8 border border-neutral-200 bg-white shadow-lg reveal-up">
          <h1 className="text-2xl font-bold text-neutral-900 font-display mb-6">Complete Payment</h1>

          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/60 mb-6">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Order Summary</div>
            <div className="space-y-2 text-sm text-neutral-700">
              <div className="flex justify-between">
                <span>{product.name}</span>
                <span className="font-semibold">₹{priceToUse} × {form.quantity} {product.unit}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-neutral-200 pt-3 mt-3">
                <span>Total Amount Due</span>
                <span className="text-primary-700 text-xl font-extrabold">₹{total}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent-50 border border-accent-200/80 rounded-2xl p-4 mb-6 text-xs text-accent-700 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <div>
              <strong className="font-bold">Demo Payment Gateway:</strong> Clicking pay simulates instant UPI/Card payment confirmation without charging real money.
            </div>
          </div>

          <button
            onClick={handleMockPayment}
            disabled={placing}
            className="btn-accent w-full py-4 text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <CreditCard className="h-5 w-5" />
            {placing ? 'Processing Payment...' : `Pay ₹${total} Now`}
          </button>
        </div>
      )}

      {/* ORDER FORM STEP */}
      {step === 'order' && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold text-neutral-900 font-display">Place Fresh Order</h1>
          </div>

          {/* Product Detail Card */}
          <div className="card rounded-2xl p-5 mb-6 border border-neutral-200 bg-white shadow-sm flex items-start gap-4">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-700 shrink-0">
              <Sprout className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-neutral-900 text-lg">{product.name}</h2>
              <p className="text-neutral-500 text-xs capitalize mb-1">{product.category}</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-extrabold ${isSeasonalActive ? 'text-accent-600' : 'text-primary-700'}`}>
                  ₹{priceToUse}
                </span>
                <span className="text-xs text-neutral-500">per {product.unit}</span>
              </div>
              {product.farmerId && (
                <div className="flex items-center gap-3 text-xs text-neutral-600 mt-2 pt-2 border-t border-neutral-100">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary-600" /> {product.farmerId.name}</span>
                  {product.farmerId.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-neutral-400" /> {product.farmerId.location}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="card rounded-2xl p-6 border border-neutral-200 bg-white shadow-sm space-y-5">
            <div>
              <label className="label">Quantity ({product.unit})</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
                  className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={product.quantityAvailable}
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Math.max(1, Number(e.target.value)) })}
                  className="input-field text-center font-bold text-lg max-w-[120px]"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, quantity: Math.min(product.quantityAvailable, Number(form.quantity) + 1) })}
                  className="p-3 rounded-xl border border-neutral-200 hover:bg-neutral-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-xs text-neutral-500 font-medium ml-2">
                  (Max {product.quantityAvailable} {product.unit})
                </span>
              </div>
            </div>

            <div>
              <label className="label">Fulfillment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'pickup' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs capitalize transition-all ${
                    form.deliveryType === 'pickup'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Farm Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, deliveryType: 'delivery' })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs capitalize transition-all ${
                    form.deliveryType === 'delivery'
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  Home Delivery
                </button>
              </div>
            </div>

            {form.deliveryType === 'delivery' && (
              <div>
                <label className="label">Delivery Address *</label>
                <textarea
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="Street address, house number, landmark, PIN code"
                  rows={3}
                  className="input-field py-2.5 resize-none text-sm"
                />
              </div>
            )}

            <div>
              <label className="label">Notes for Farmer (Optional)</label>
              <input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Preferred pickup time, packing requests..."
                className="input-field py-2.5 text-sm"
              />
            </div>

            <div className="bg-primary-50/80 border border-primary-200/60 rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="text-xs text-neutral-500">Total Order Cost</div>
                <div className="text-2xl font-extrabold text-primary-700">₹{total}</div>
              </div>
              <div className="text-xs font-medium text-neutral-600">
                {form.quantity} {product.unit} × ₹{priceToUse}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="btn-primary w-full py-4 text-base font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              {placing ? 'Placing Order...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}