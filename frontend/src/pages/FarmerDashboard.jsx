import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  getProductsByFarmer, getFarmerOrders, updateOrderStatus,
  deleteProduct, getFarmerGroupBuys, counterGroupBuyPrice, requestVerification
} from '../services/api'
import { StatCardSkeleton, TableRowSkeleton } from '../components/SkeletonLoader'
import {
  Tractor,
  Package,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  MapPin,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Phone,
  User,
  ArrowRight
} from 'lucide-react'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [groupBuys, setGroupBuys] = useState([])
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(true)

  // Counter offer state
  const [counteringId, setCounteringId] = useState(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [submittingCounter, setSubmittingCounter] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pRes, oRes, gRes] = await Promise.all([
        getProductsByFarmer(user._id),
        getFarmerOrders(user._id),
        getFarmerGroupBuys()
      ])
      setProducts(pRes.data)
      setOrders(oRes.data)
      setGroupBuys(gRes.data)
    } catch {
      toast.error('Failed to load farmer dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success(`Order marked as ${status}!`)
      fetchData()
    } catch {
      toast.error('Failed to update order status')
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return
    try {
      await deleteProduct(productId)
      toast.success('Product listing deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete product')
    }
  }

  const handleRequestVerification = async () => {
    try {
      await requestVerification()
      toast.success('Verification request submitted to admin!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification request failed')
    }
  }

  const handleCounterGroupBuy = async (groupBuyId) => {
    if (!counterPrice || Number(counterPrice) <= 0) {
      toast.error('Enter a valid positive counter price')
      return
    }
    setSubmittingCounter(true)
    try {
      await counterGroupBuyPrice(groupBuyId, Number(counterPrice))
      toast.success('Counter price sent to group participants! 🔄')
      setCounteringId(null)
      setCounterPrice('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send counter offer')
    } finally {
      setSubmittingCounter(false)
    }
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <TableRowSkeleton key={i} />)}
      </div>
    </div>
  )

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const openGroupBuys = groupBuys.filter(g => g.status === 'open')

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header Banner */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-neutral-900 font-display">
              Welcome, {user.name}
            </h1>
            {user.isVerified && (
              <span className="badge badge-primary py-1 px-2.5 text-xs flex items-center gap-1 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Grower
              </span>
            )}
          </div>
          <p className="text-neutral-500 text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-neutral-400" />
            {user.location || 'Farm Location Not Set'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!user.isVerified && (
            <button
              onClick={handleRequestVerification}
              className="btn-outline text-xs py-2.5 px-4 flex items-center gap-1.5 border-primary-300 text-primary-700 hover:bg-primary-50"
            >
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              Request Verification
            </button>
          )}

          <Link
            to="/farmer/add-product"
            className="btn-primary text-sm px-5 py-2.5 shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 border border-neutral-200/80 bg-white shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-neutral-900">{products.length}</div>
            <div className="text-xs font-semibold text-neutral-500">Active Listings</div>
          </div>
        </div>

        <div className="card p-5 border border-neutral-200/80 bg-white shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shrink-0">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-neutral-900">{orders.length}</div>
            <div className="text-xs font-semibold text-neutral-500">Total Orders</div>
          </div>
        </div>

        <div className="card p-5 border border-neutral-200/80 bg-white shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-700">{pendingOrders.length}</div>
            <div className="text-xs font-semibold text-neutral-500">Pending Actions</div>
          </div>
        </div>

        <div className="card p-5 border border-neutral-200/80 bg-white shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-primary-700">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-xs font-semibold text-neutral-500">Completed Orders</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-neutral-200/80 mb-6 overflow-x-auto">
        <button
          onClick={() => setTab('products')}
          className={`pb-3.5 px-5 font-bold text-sm capitalize transition border-b-2 -mb-px flex items-center gap-2 ${
            tab === 'products'
              ? 'border-primary-700 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>My Products ({products.length})</span>
        </button>

        <button
          onClick={() => setTab('orders')}
          className={`pb-3.5 px-5 font-bold text-sm capitalize transition border-b-2 -mb-px flex items-center gap-2 ${
            tab === 'orders'
              ? 'border-primary-700 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Customer Orders ({orders.length})</span>
          {pendingOrders.length > 0 && (
            <span className="ml-1 bg-accent-500 text-white text-[10px] font-bold rounded-full h-5 px-2 flex items-center justify-center animate-pulse">
              {pendingOrders.length} New
            </span>
          )}
        </button>

        <button
          onClick={() => setTab('groupbuys')}
          className={`pb-3.5 px-5 font-bold text-sm capitalize transition border-b-2 -mb-px flex items-center gap-2 ${
            tab === 'groupbuys'
              ? 'border-primary-700 text-primary-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Group Buying Deals ({groupBuys.length})</span>
          {openGroupBuys.length > 0 && (
            <span className="ml-1 bg-purple-600 text-white text-[10px] font-bold rounded-full h-5 px-2 flex items-center justify-center">
              {openGroupBuys.length} Open
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: PRODUCTS */}
      {tab === 'products' && (
        <div>
          {products.length === 0 ? (
            <div className="card rounded-3xl p-16 text-center border border-neutral-200 bg-white max-w-md mx-auto my-6">
              <Sprout className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-800 font-display">No Products Listed Yet</h3>
              <p className="text-neutral-500 text-sm mt-2">
                Add your harvest items, crops, or dairy produce to start receiving direct orders.
              </p>
              <Link
                to="/farmer/add-product"
                className="btn-primary mt-6 inline-flex items-center gap-2 text-sm py-2.5 px-6"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Your First Product</span>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((p) => (
                <div key={p._id} className="card rounded-2xl p-5 border border-neutral-200/80 bg-white shadow-sm hover:shadow transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-bold text-neutral-900 text-lg font-display">{p.name}</h3>
                      <span className={`badge py-0.5 px-2.5 text-[10px] capitalize font-bold ${
                        p.isActive ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {p.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm text-neutral-600 mb-5">
                      <div className="font-extrabold text-primary-700 text-lg">₹{p.pricePerUnit} <span className="text-xs font-normal text-neutral-500">per {p.unit}</span></div>
                      <div className="text-xs font-medium text-neutral-500">Available Stock: <strong className="text-neutral-800">{p.quantityAvailable} {p.unit}</strong></div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-neutral-100 pt-4">
                    <Link
                      to={`/farmer/edit-product/${p._id}`}
                      className="flex-1 btn-outline py-2 text-xs font-bold justify-center flex items-center gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 rounded-xl bg-accent-50 hover:bg-accent-100 text-accent-700 font-bold text-xs py-2 transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="card rounded-3xl p-16 text-center border border-neutral-200 bg-white max-w-md mx-auto my-6">
              <ClipboardList className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-800 font-display">No Customer Orders Yet</h3>
              <p className="text-neutral-500 text-sm mt-2">Incoming orders from local buyers will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="card rounded-2xl p-5 border border-neutral-200/80 bg-white shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-neutral-900 text-lg font-display">
                        {order.productId?.name || 'Item'}
                      </h3>
                      <span className={`badge px-3 py-1 text-xs font-bold capitalize ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'accepted' ? 'bg-sky-100 text-sky-800' :
                        order.status === 'completed' ? 'bg-primary-100 text-primary-800' :
                        'bg-accent-100 text-accent-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className={`badge px-3 py-1 text-xs font-bold capitalize ${
                        order.paymentStatus === 'paid' ? 'bg-primary-100 text-primary-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-600 space-y-1 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                      <div>Buyer: <strong className="text-neutral-900">{order.buyerId?.name}</strong> • Phone: <a href={`tel:${order.buyerId?.phoneNumber}`} className="text-primary-700 font-bold">{order.buyerId?.phoneNumber}</a></div>
                      <div>Quantity Ordered: <strong>{order.quantityOrdered} {order.productId?.unit}</strong> • Total Revenue: <strong className="text-primary-700 font-bold">₹{order.totalPrice}</strong></div>
                      <div>Delivery Mode: <strong className="capitalize">{order.deliveryType}</strong> {order.deliveryAddress ? `(${order.deliveryAddress})` : ''}</div>
                      <div>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'accepted')}
                          className="btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5 font-bold"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Accept Order
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                          className="rounded-xl bg-accent-50 text-accent-700 hover:bg-accent-100 text-xs py-2 px-4 font-bold transition"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'completed')}
                        className="btn-accent text-xs py-2 px-4 shadow-sm flex items-center gap-1.5 font-bold"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: GROUP BUYS */}
      {tab === 'groupbuys' && (
        <div className="space-y-4">
          {groupBuys.length === 0 ? (
            <div className="card rounded-3xl p-16 text-center border border-neutral-200 bg-white max-w-md mx-auto my-6">
              <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-800 font-display">No Active Group Buys</h3>
              <p className="text-neutral-500 text-sm mt-2">Group buys initiated by buyers for your products will show here.</p>
            </div>
          ) : (
            groupBuys.map((gb) => {
              const progressPercent = Math.round((gb.currentQuantity / gb.targetQuantity) * 100)
              const discount = Math.round(
                ((gb.productId?.pricePerUnit - gb.unlockedPrice) / gb.productId?.pricePerUnit) * 100
              )

              return (
                <div key={gb._id} className="card rounded-2xl p-6 border border-neutral-200 bg-white shadow-sm space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900 text-lg font-display">{gb.title}</h3>
                        <span className="badge bg-purple-100 text-purple-800 font-bold text-xs capitalize">{gb.status}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">Item: {gb.productId?.name} • Started by {gb.creatorId?.name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-extrabold text-purple-700">₹{gb.unlockedPrice}/{gb.productId?.unit}</div>
                      <div className="text-xs text-neutral-400 line-through">₹{gb.productId?.pricePerUnit} regular</div>
                      <div className="text-xs font-bold text-primary-600">{discount}% Group Discount</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-600">
                      <span>Progress: {gb.currentQuantity}/{gb.targetQuantity} {gb.productId?.unit}</span>
                      <span>{progressPercent}% unlocked</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, progressPercent)}%` }} />
                    </div>
                  </div>

                  {gb.status === 'open' && (
                    <div className="pt-2 border-t border-neutral-100">
                      {counteringId === gb._id ? (
                        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-3">
                          <div className="text-xs font-bold text-amber-900">Counter Price Offer for Group Buy</div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              placeholder={`Counter ₹ per ${gb.productId?.unit}`}
                              className="input-field text-sm py-2 flex-1"
                            />
                            <button
                              onClick={() => handleCounterGroupBuy(gb._id)}
                              disabled={submittingCounter}
                              className="btn-accent text-xs font-bold px-4 py-2"
                            >
                              {submittingCounter ? 'Sending...' : 'Send Counter'}
                            </button>
                            <button
                              onClick={() => setCounteringId(null)}
                              className="btn-outline text-xs font-bold px-3 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCounteringId(gb._id)}
                          className="btn-outline text-xs font-bold px-4 py-2 border-amber-300 text-amber-800 hover:bg-amber-50 flex items-center gap-1.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Counter Group Price
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}