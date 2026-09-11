import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FreshRootsLogo } from '../components/Icons'
import {
  Sprout,
  Tractor,
  Package,
  ShieldCheck,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Users,
  ShoppingBag,
  Sparkles,
  HeartHandshake,
  Quote,
  TrendingUp,
  MapPin,
  Scale
} from 'lucide-react'

const categories = [
  { name: 'Vegetables', icon: Sprout, path: 'vegetables' },
  { name: 'Fruits', icon: Sprout, path: 'fruits' },
  { name: 'Milk & Dairy', icon: ShoppingBag, path: 'milk & dairy' },
  { name: 'Meat', icon: Package, path: 'meat' },
  { name: 'Eggs', icon: Package, path: 'eggs' },
  { name: 'Crops', icon: Tractor, path: 'crops' },
  { name: 'Farm-Made', icon: ShoppingBag, path: 'farm-made products' },
]

const equotes = [
  {
    quote: "Know your farmer, trust your food.",
    author: "FreshRoots Motto",
    role: "Core Platform Philosophy"
  },
  {
    quote: "Eating is an agricultural act. When you know who grew your food, every meal becomes a celebration of community and health.",
    author: "Wendell Berry",
    role: "Farmer & Author"
  },
  {
    quote: "The ultimate goal of farming is not the growing of crops, but the cultivation and humanization of human beings.",
    author: "Masanobu Fukuoka",
    role: "Natural Farming Pioneer"
  },
  {
    quote: "Fair prices for hardworking farmers, fresh nutrient-rich food for families — zero middleman markup.",
    author: "FreshRoots Guarantee",
    role: "Direct Trade Promise"
  }
]

const steps = [
  { step: '01', title: 'Farmers List Produce', desc: 'Farmers set their harvest quantity, price, and pickup/delivery options.' },
  { step: '02', title: 'Buyers Discover Nearby', desc: 'Consumers & businesses connect directly with verified local growers.' },
  { step: '03', title: 'Fair Deals & Orders', desc: 'Negotiate prices, join group buys, or pre-book upcoming harvests directly.' },
  { step: '04', title: 'Soil to Soul Delivery', desc: 'Fresh farm products are picked and delivered without middleman markups.' },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white border-b border-primary-700/50">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-28">
          <div className="reveal-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-700/90 px-4 py-1.5 text-xs font-bold text-primary-100 backdrop-blur-md border border-primary-500/40 mb-6 shadow-sm">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span>Direct Farmer-to-Consumer Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-display">
              Know your farmer,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-primary-200 to-accent-300">
                trust your food.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-primary-100 font-normal">
              FreshRoots connects local growers directly with conscious buyers. Eliminate middlemen, support sustainable agriculture, and enjoy fresh harvests straight from local fields.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to={user.role === 'farmer' ? '/farmer/dashboard' : '/browse'}
                  className="btn-accent text-base px-8 py-3.5 shadow-lg hover:shadow-accent-500/30 flex items-center gap-2 font-bold"
                >
                  {user.role === 'farmer' ? 'Go to Farmer Dashboard' : 'Explore Nearby Produce'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register?role=farmer" className="btn-accent text-base px-8 py-3.5 shadow-lg flex items-center gap-2 font-bold">
                    <Tractor className="h-5 w-5" />
                    Join as Farmer
                  </Link>
                  <Link to="/browse" className="btn-secondary border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary-900 backdrop-blur-md text-base px-8 py-3.5 flex items-center gap-2 font-bold">
                    <ShoppingBag className="h-5 w-5" />
                    Shop Fresh Food
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Connected Farmers & Buyers Visual Card */}
          <div className="reveal-up rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-primary-950/70 p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <FreshRootsLogo className="h-12 w-12" />
                <div>
                  <div className="text-lg font-bold text-white font-display">FreshRoots Ecosystem</div>
                  <div className="text-xs text-primary-200">Connecting Farmers & Buyers</div>
                </div>
              </div>
              <span className="badge bg-accent-500 text-white font-bold text-xs px-3 py-1 animate-pulse">DIRECT LINK</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                    <Tractor className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">For Farmers</h3>
                    <p className="text-[11px] text-primary-700 font-semibold">100% Fair Pricing</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">List harvests, set your prices, and earn directly without middleman cuts.</p>
              </div>

              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100 flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">For Buyers</h3>
                    <p className="text-[11px] text-accent-600 font-semibold">Traceable Freshness</p>
                  </div>
                </div>
                <p className="text-xs text-neutral-600">Buy fresh produce, join group buys, and know exactly who grew your food.</p>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-primary-800/80 to-primary-900/80 p-4 border border-white/10 text-xs text-primary-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-accent-400 shrink-0" />
                <span>Pre-harvest bookings, price negotiations & subscription boxes</span>
              </div>
              <span className="font-bold text-white shrink-0">100% Direct</span>
            </div>
          </div>
        </div>
      </section>

      {/* E-Quotes & Philosophy Banner */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-16 text-white border-b border-primary-700/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge bg-white/10 text-primary-200 text-xs px-3 py-1 uppercase tracking-widest font-bold border border-white/10">Our Philosophy</span>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white mt-3">Agricultural E-Quotes & Values</h2>
            <p className="text-sm text-primary-200 mt-2">What drives the FreshRoots soil-to-soul movement</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {equotes.map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-lg flex flex-col justify-between hover:bg-white/15 transition-all duration-300"
              >
                <div>
                  <Quote className="h-8 w-8 text-accent-400 mb-4 opacity-80" />
                  <p className="text-sm font-medium leading-relaxed text-primary-50 italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="font-bold text-sm text-white font-display">{item.author}</div>
                  <div className="text-xs text-primary-300">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Counter Stats Banner */}
      <section className="bg-accent-500 py-10 text-white shadow-md">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {[
            { num: '500+', label: 'Local Farmers' },
            { num: '50+', label: 'Produce Categories' },
            { num: '0%', label: 'Middleman Cut' },
            { num: '100%', label: 'Fair Trade Guarantee' },
          ].map((s) => (
            <div key={s.label} className="p-2">
              <div className="text-4xl font-extrabold font-display">{s.num}</div>
              <div className="mt-1 text-sm font-semibold text-accent-100">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Connected Dual Portal Section */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-24 md:grid-cols-2">
        <div className="card rounded-3xl border-l-4 border-l-primary-600 p-8 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-primary-50/40">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-primary text-xs py-1 px-3 font-bold">For Farmers & Growers</span>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 font-display mb-4">Direct Market Access</h2>
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            Eliminate commission fees. Sell directly to households, restaurants, and bulk buyers in your region with full pricing freedom.
          </p>
          <ul className="space-y-3 text-neutral-700 mb-8 text-sm">
            {[
              'Set your custom price per unit without retail pressure',
              'List daily harvests, upcoming produce, and custom subscription boxes',
              'Accept pre-harvest bookings to guarantee buyers before harvest day',
              'Tell your farm story and gain verified grower status',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=farmer" className="btn-primary inline-flex items-center gap-2 font-bold px-6 py-3">
            <Tractor className="h-4 w-4" />
            <span>Register as Farmer</span>
          </Link>
        </div>

        <div className="card rounded-3xl border-l-4 border-l-accent-500 p-8 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-accent-50/40">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-accent text-xs py-1 px-3 font-bold">For Buyers & Families</span>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 font-display mb-4">Freshness You Can Trust</h2>
          <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
            Enjoy farm-fresh food harvested at peak ripeness. Know who grew your food and support your local farm economy.
          </p>
          <ul className="space-y-3 text-neutral-700 mb-8 text-sm">
            {[
              'Order farm-fresh vegetables, fruits, dairy, and crops',
              'Know the exact farmer, location, and farm story behind your food',
              'Join Group Buys to unlock wholesale price discounts with neighbors',
              'Negotiate custom prices for bulk or recurring orders',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=buyer" className="btn-accent inline-flex items-center gap-2 font-bold px-6 py-3">
            <ShoppingBag className="h-4 w-4" />
            <span>Register as Buyer</span>
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-neutral-100/80 py-20 border-y border-neutral-200/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-900">Explore Fresh Categories</h2>
            <p className="mt-3 text-neutral-600 text-sm">Browse produce listed by verified farmers in your region.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7">
            {categories.map((c) => {
              const IconComp = c.icon
              return (
                <Link
                  to={`/browse?category=${encodeURIComponent(c.path)}`}
                  key={c.name}
                  className="card hover-lift p-5 text-center flex flex-col items-center justify-center gap-3 border border-neutral-200/80 bg-white hover:border-primary-400 transition-all rounded-2xl shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-neutral-800">{c.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-900">How FreshRoots Connects You</h2>
          <p className="mt-3 text-neutral-600 text-sm">4 simple steps to fair, transparent farm trade.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 font-display text-3xl font-extrabold text-accent-500">{s.step}</div>
              <h3 className="mb-2 text-lg font-bold text-neutral-900">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">Ready for Fair, Direct Farm Trade?</h2>
          <p className="mt-4 text-lg text-primary-100">
            "Know your farmer, trust your food." Join thousands of farmers and buyers today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register?role=farmer" className="btn-accent px-8 py-3.5 text-base font-bold shadow-lg">
              Start Selling Produce
            </Link>
            <Link to="/register?role=buyer" className="btn-secondary border-white bg-white text-primary-900 hover:bg-primary-50 px-8 py-3.5 text-base font-bold">
              Start Buying Fresh
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 py-10 text-center text-sm text-neutral-400 border-t border-neutral-800">
        <div className="flex items-center justify-center gap-2 text-xl font-bold text-white font-display mb-1">
          <FreshRootsLogo className="h-6 w-6" />
          FreshRoots
        </div>
        <div className="text-xs text-neutral-500">Soil to Soul • Know your farmer, trust your food</div>
        <div className="mt-4 text-xs text-neutral-600">© 2026 FreshRoots. All rights reserved.</div>
      </footer>
    </div>
  )
}
