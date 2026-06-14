import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const categories = [
  { token: 'CR', name: 'Crops' },
  { token: 'VG', name: 'Vegetables' },
  { token: 'FR', name: 'Fruits' },
  { token: 'DY', name: 'Milk & Dairy' },
  { token: 'MT', name: 'Meat' },
  { token: 'EG', name: 'Eggs' },
  { token: 'FM', name: 'Farm-Made' },
]

const steps = [
  { step: '01', title: 'Farmers list products', desc: 'Farmers add fresh products with their own prices, quantity, and availability.' },
  { step: '02', title: 'Buyers browse nearby', desc: 'Homes, restaurants, shops, and bulk buyers find local farm supply directly.' },
  { step: '03', title: 'Orders are confirmed', desc: 'The farmer receives the order and confirms pickup, delivery, or bulk details.' },
  { step: '04', title: 'Trade stays fair', desc: 'Buyers get traceable food while farmers keep more of the final price.' },
]

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-primary-700 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-24">
          <div>
            <div className="badge mb-6 bg-primary-600 text-primary-50">
              Direct from farmers
            </div>
            <h1 className="max-w-3xl text-white">
              FreshRoots
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-primary-100">
              A direct farmer-to-buyer marketplace for fresh food, honest pricing, and farm relationships without middlemen.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to={user.role === 'farmer' ? '/farmer/dashboard' : '/browse'}
                  className="btn-accent text-base"
                >
                  {user.role === 'farmer' ? 'Go to dashboard' : 'Browse products'}
                </Link>
              ) : (
                <>
                  <Link to="/register?role=farmer" className="btn-accent text-base">
                    Join as farmer
                  </Link>
                  <Link to="/register?role=buyer" className="btn-secondary border-white bg-white text-primary-700 hover:bg-primary-50">
                    Join as buyer
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-primary-500/50 bg-primary-800/45 p-6 shadow-xl">
            <div className="grid gap-4">
              {[
                { label: 'Farmers decide price', value: '100%' },
                { label: 'Middlemen required', value: '0' },
                { label: 'Product types', value: '50+' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/10 p-5">
                  <div className="font-display text-4xl font-bold text-white">{item.value}</div>
                  <div className="mt-1 text-sm text-primary-100">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-accent-500 py-8 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 text-center md:grid-cols-4">
          {[
            { num: '500+', label: 'Farmers' },
            { num: '50+', label: 'Product Types' },
            { num: '0', label: 'Middlemen' },
            { num: '100%', label: 'Fair Price' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-bold">{s.num}</div>
              <div className="mt-1 text-sm text-accent-100">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-20 md:grid-cols-2">
        <div className="card border-l-4 border-l-primary-500 p-8">
          <span className="badge badge-primary mb-4">For farmers</span>
          <h2 className="mb-5 text-3xl">Sell with control</h2>
          <ul className="mb-6 space-y-3 text-neutral-600">
            {[
              'Set your own price without marketplace pressure',
              'List any quantity, from small harvests to bulk supply',
              'Receive orders directly from nearby buyers',
              'Build trust with your farm story and verification',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=farmer" className="btn-primary">
            Join as farmer
          </Link>
        </div>

        <div className="card border-l-4 border-l-accent-400 p-8">
          <span className="badge badge-accent mb-4">For buyers</span>
          <h2 className="mb-5 text-3xl">Buy closer to source</h2>
          <ul className="mb-6 space-y-3 text-neutral-600">
            {[
              'Buy directly from farmers and local producers',
              'Know who grew, packed, or prepared your food',
              'Find seasonal deals, harvests, boxes, and group buys',
              'Order for home, retail, restaurant, or bulk needs',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/register?role=buyer" className="btn-accent">
            Join as buyer
          </Link>
        </div>
      </section>

      <section className="bg-neutral-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2>What's on FreshRoots?</h2>
            <p className="mt-3">Everything that comes from a farm, directly to you.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((c) => (
              <Link
                to={`/browse?category=${c.name.toLowerCase()}`}
                key={c.name}
                className="card hover-lift p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 font-bold text-primary-700">
                  {c.token}
                </div>
                <div className="text-sm font-semibold text-neutral-700">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2>How it works</h2>
          <p className="mt-3">Four steps. Zero complexity.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.step} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="mb-4 font-display text-3xl font-bold text-accent-500">{s.step}</div>
              <h3 className="mb-2 text-lg">{s.title}</h3>
              <p className="text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-700 px-6 py-16 text-center text-white">
        <h2 className="text-white">Ready to go middleman-free?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
          Join farmers and buyers already trading closer to the source.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/register?role=farmer" className="btn-accent">
            Start selling
          </Link>
          <Link to="/register?role=buyer" className="btn-secondary border-white bg-white text-primary-700 hover:bg-primary-50">
            Start buying
          </Link>
        </div>
      </section>

      <footer className="bg-neutral-900 py-8 text-center text-sm text-neutral-400">
        <div className="font-display text-xl font-bold text-white">FreshRoots</div>
        <div className="mt-1 text-xs text-neutral-500">Soil to Soul - Direct from Farmers</div>
        <div className="mt-4">Copyright 2024 FreshRoots. Built for fair farm trade.</div>
      </footer>
    </div>
  )
}
