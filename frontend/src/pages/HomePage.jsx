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
  HeartHandshake
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
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-800 via-primary-700 to-primary-800 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
          <div className="reveal-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-600/80 px-4 py-1.5 text-xs font-semibold text-primary-100 backdrop-blur-sm border border-primary-500/40 mb-6">
              <Sparkles className="h-4 w-4 text-accent-400" />
              Direct From Local Farmers
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-display">
              Know your farmer.<br />Trust your food.
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-primary-100 font-normal">
              A transparent, middleman-free marketplace connecting conscious consumers with passionate local farmers. Fresh harvests, fair prices, and authentic relationships.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to={user.role === 'farmer' ? '/farmer/dashboard' : '/browse'}
                  className="btn-accent text-base px-7 py-3.5 shadow-lg hover:shadow-accent-500/25 flex items-center gap-2"
                >
                  {user.role === 'farmer' ? 'Go to Dashboard' : 'Explore Fresh Produce'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register?role=farmer" className="btn-accent text-base px-7 py-3.5 shadow-lg flex items-center gap-2">
                    <Tractor className="h-5 w-5" />
                    Sell as Farmer
                  </Link>
                  <Link to="/browse" className="btn-secondary border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary-800 backdrop-blur-sm text-base px-7 py-3.5 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Marketplace
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="reveal-up rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-2xl">
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-primary-900/60 p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <FreshRootsLogo className="h-12 w-12" />
                <div>
                  <div className="text-lg font-bold text-white font-display">FreshRoots</div>
                  <div className="text-xs text-primary-200">Soil to Soul Direct Trade</div>
                </div>
              </div>
              <span className="badge bg-accent-500 text-white font-bold text-xs px-3 py-1">LIVE MARKET</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="font-bold text-base">Fresh Harvests</div>
                <div className="mt-1 text-xs text-neutral-500">Organically grown vegetables</div>
              </div>

              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Package className="h-5 w-5" />
                </div>
                <div className="font-bold text-base">Subscription Boxes</div>
                <div className="mt-1 text-xs text-neutral-500">Weekly farm deliveries</div>
              </div>

              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="font-bold text-base">Verified Farmers</div>
                <div className="mt-1 text-xs text-neutral-500">100% authentic local sources</div>
              </div>

              <div className="rounded-2xl bg-white p-5 text-neutral-800 shadow-md border border-neutral-100">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="font-bold text-base">Group Buying</div>
                <div className="mt-1 text-xs text-neutral-500">Unlock bulk price discounts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Counter Stats Banner */}
      <section className="bg-accent-500 py-10 text-white shadow-md">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {[
            { num: '500+', label: 'Local Farmers' },
            { num: '50+', label: 'Crop Categories' },
            { num: '0%', label: 'Middleman Margin' },
            { num: '100%', label: 'Traceable Food' },
          ].map((s) => (
            <div key={s.label} className="p-2">
              <div className="text-4xl font-extrabold font-display">{s.num}</div>
              <div className="mt-1 text-sm font-medium text-accent-100">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Audience Section */}
      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-24 md:grid-cols-2">
        <div className="card rounded-3xl border-l-4 border-l-primary-600 p-8 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-primary-50/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-primary text-xs py-1 px-3">For Farmers</span>
          </div>
          <h2 className="text-3xl font-bold text-neutral-800 font-display mb-4">Sell with Full Control</h2>
          <ul className="space-y-3 text-neutral-600 mb-8">
            {[
              'Set your own prices without retail pressure',
              'List any harvest quantity, from daily yields to bulk supplies',
              'Direct orders & pre-harvest commitment pre-bookings',
              'Build long-term customer relationships with Farm Stories',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=farmer" className="btn-primary inline-flex items-center gap-2">
            <Tractor className="h-4 w-4" />
            Join as Farmer
          </Link>
        </div>

        <div className="card rounded-3xl border-l-4 border-l-accent-500 p-8 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-accent-50/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge badge-accent text-xs py-1 px-3">For Buyers</span>
          </div>
          <h2 className="text-3xl font-bold text-neutral-800 font-display mb-4">Buy Direct from Source</h2>
          <ul className="space-y-3 text-neutral-600 mb-8">
            {[
              'Freshly harvested food delivered directly to your doorstep',
              'Know the exact farmer, location, and origin of your food',
              'Unlock discounts via price negotiations and group buying',
              'Subscribe to weekly produce boxes customized for your home',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-accent-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=buyer" className="btn-accent inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Join as Buyer
          </Link>
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-neutral-100/70 py-20 border-y border-neutral-200/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-900">Explore Fresh Categories</h2>
            <p className="mt-3 text-neutral-600">Discover fresh produce directly from farms in your area.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-7">
            {categories.map((c) => {
              const IconComp = c.icon
              return (
                <Link
                  to={`/browse?category=${encodeURIComponent(c.path)}`}
                  key={c.name}
                  className="card hover-lift p-5 text-center flex flex-col items-center justify-center gap-3 border border-neutral-200/80 bg-white hover:border-primary-300 transition-all rounded-2xl"
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
          <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-900">How FreshRoots Works</h2>
          <p className="mt-3 text-neutral-600">4 simple steps to fair, transparent farm trade.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 font-display text-3xl font-extrabold text-accent-500">{s.step}</div>
              <h3 className="mb-2 text-lg font-bold text-neutral-800">{s.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-800 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">Ready for Fair, Direct Farm Trade?</h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of farmers and conscious buyers building a sustainable food ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register?role=farmer" className="btn-accent px-8 py-3.5 text-base shadow-lg">
              Start Selling
            </Link>
            <Link to="/register?role=buyer" className="btn-secondary border-white bg-white text-primary-800 hover:bg-primary-50 px-8 py-3.5 text-base">
              Start Buying
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
        <div className="text-xs text-neutral-500">Soil to Soul • Direct Farm Marketplace</div>
        <div className="mt-4 text-xs text-neutral-600">© 2026 FreshRoots. All rights reserved.</div>
      </footer>
    </div>
  )
}
